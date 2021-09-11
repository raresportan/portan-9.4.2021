import { createMachine, assign, Sender, Interpreter } from 'xstate';
import { createOrderbook, updateOrderbook, isSlowDevice } from './domain-functions';
import { OrderbookData } from '../types';

const HOST = process.env.NEXT_PUBLIC_ORDERBOOK_WS_HOST as string;
const FEED_TYPE = process.env.NEXT_PUBLIC_ORDERBOOK_WS_FEED_TYPE as string;

let socket:WebSocket;

export type Feed = "PI_XBTUSD" | "PI_ETHUSD";

interface WebSocketEvent {
  data: any
}

export interface OrderbookMachineContext {
  initialized: boolean,
  forcePause: boolean,
  feed: Feed,
  data: OrderbookData | undefined,
  error: Error | undefined
}

export type OrderbookMachineEvent =
  | { type: 'CONNECT' }
  | { type: 'CONNECTED' }
  | { type: 'FAILURE', error: any }
  | { type: 'PAUSE', forced: boolean }
  | { type: 'PAUSED' }
  | { type: 'START' }
  | { type: 'STARTED' }
  | { type: 'RECEIVE', data: OrderbookData }
  | { type: 'SWITCH', feed: Feed }
  | { type: 'CLOSE' }


export type OrderbookMachineState = 
  | { value: 'idle', context: OrderbookMachineContext & { feed: Feed } }
  | { value: 'pending', context: OrderbookMachineContext & { feed: Feed, error: undefined }}
  | { value: 'connected', context: OrderbookMachineContext & { feed: Feed, error: undefined }}
  | { value: 'started', context: OrderbookMachineContext & { feed: Feed, error: undefined }}
  | { value: 'paused', context: OrderbookMachineContext & { feed: Feed, error: undefined }}


export type OrderbookService = Interpreter<OrderbookMachineContext, OrderbookMachineState, OrderbookMachineEvent, any>;  
export type OrderbookSelector = (ctx: OrderbookMachineContext) => Feed | OrderbookData | Error | undefined;


interface EventProcessor {
  setCallback: Function,
  processEvent:Function,
  clear:Function
}  

const eventProcessor:EventProcessor = (function() {
  const queue:Array<WebSocketEvent> = [];
  let orderbook:OrderbookData;
  let sender:Sender<any>;
  let startTimestamp:number = 0;
  let throttle:boolean | undefined = undefined;

  function workLoop(timestamp:number) {    
    if(startTimestamp === 0) startTimestamp = timestamp;
    if(throttle === undefined) throttle = isSlowDevice();
    if (timestamp - startTimestamp > (throttle ? 200 : 0)){
      startTimestamp = 0;

      const event = queue.shift();
      if(event) {
        try {
          const data = JSON.parse(event.data);
          if(data && (data.asks || data.bids)){
            if(/snapshot/g.test(data.feed)) {
              orderbook = createOrderbook(data);
              sender && sender({ type:'RECEIVE', data: orderbook });
            } else {
              orderbook = updateOrderbook(orderbook, data);
              sender && sender({ type:'RECEIVE', data: orderbook });
            }
          }
        }
        catch (err) {
          //console.log(err);
        }
      }
    }   
    window && window.requestAnimationFrame(workLoop);
  }
  // start doing workLoop
  window && window.requestAnimationFrame(workLoop)

  return {
    setCallback: (callback:Sender<any>) => { sender = callback},
    processEvent: (event:WebSocketEvent) => queue.push(event),  
    clear: () => { queue.length = 0 }
  }
}())



const websocketMachine = createMachine<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState>({
  id: 'websocket',
  initial: 'idle',
  context: {
    initialized: false,
    forcePause: false,
    feed: 'PI_XBTUSD',
    data: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: { 
        CONNECT: 'pending' 
      }
    },
    pending: {
      invoke: {
        id:'connectWebsocket',
        src: () => (callback) => {
          try {
            socket = new WebSocket(HOST);

            const connectedHandler = () => callback('CONNECTED');
            socket.addEventListener('open', connectedHandler);            

            return () => {
              socket?.removeEventListener('open', connectedHandler);
            };  
          } catch(err) {
            callback({ type: 'FAILURE', error: err} );
          }
        }
      },
      on: {
         CONNECTED: {
           target: 'connected',             
           cond: (context) => !!socket && !!context.feed,
           actions: assign({ error: (context, event) => undefined })
         },  
         FAILURE: {
          target: 'idle',
          actions: assign({ error: (context, event) => event.error })
         }  
      }
    },
    connected: {
      id:'connection',
      invoke: {
        src: () => (callback) => {
          eventProcessor.setCallback(callback);

          const messageHandler = (e:WebSocketEvent) => {
              if(/"unsubscribed"/g.test(e.data)) {
                callback('PAUSED');
                eventProcessor.clear();
              }
              else if(/"subscribed"/g.test(e.data)) {
                callback('STARTED');
              } else {
                eventProcessor.processEvent(e, callback)
              }
          };              
          socket.addEventListener('message', messageHandler);    

          return () => {
            socket.removeEventListener('message', messageHandler);    
          };
        }
      },     
      initial: 'paused',
      states: {          
        starting: {
          on: {
            STARTED: {
              target:'started'
            }
          }
        },
        pausing :{
          on: {
            PAUSED: {
              target: 'paused',
            }, 
          }
        }, 
        started: {         
          on : {
            PAUSE: {
              target: 'pausing',
              actions: [
                assign({ forcePause: (context, event) => event.forced }),
                (context) => {
                  const message = `{"event": "unsubscribe","feed": "${FEED_TYPE}","product_ids": ["${context.feed}"]}`;
                  socket?.send(message);
                }
              ]
            },           
            RECEIVE: {
              actions: assign({ data: (context, event) => event.data })
            },  
          },       
        },     
        paused: {          
          on: {
            START: {
              target: 'starting',
              actions: [
                (context) => {
                  const message = `{"event": "subscribe","feed": "${FEED_TYPE}","product_ids": ["${context.feed}"]}`;
                  socket?.send(message);                             
                },
                assign({ initialized : (context, event) =>  true })
              ]
            },
            SWITCH: {
              actions: [
                assign({ feed : (context, event) =>  event.feed || context.feed }),
                assign({ data : (context, event) => {
                  eventProcessor.clear();
                  return undefined;
                }}),                
              ]
            },
            CLOSE: {
              target: '#websocket.idle',
              actions: () => {
                socket?.close();            
              }
            }
          }
        }        
      }      
    }
  }
})

export default websocketMachine;