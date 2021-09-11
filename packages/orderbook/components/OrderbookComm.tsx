import React, { useContext, useEffect } from 'react';
import { OrderbookContext } from '../contexts/OrderbookContext';
import { useSelector } from '@xstate/react';
import { OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState } from '../machines/OrderbookMachine';
import { usePageVisibility } from '../hooks/page-visibility';
import { State } from 'xstate';

// initialized  selector
const initializedSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.context.initialized;

// forced selector
const forcePauseSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.context.forcePause;

// machine idle state selector
const idleSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.matches('idle');

// machine paused state selector
const pausedSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) =>  state.matches('connected.paused');

/**
 * 
 */
const OrderbookComm = () => {
  const orderbookService = useContext(OrderbookContext);
  const isIdle = useSelector(orderbookService, idleSelector);
  const isPaused = useSelector(orderbookService, pausedSelector);
  const isInitialized = useSelector(orderbookService, initializedSelector);
  const forcePause = useSelector(orderbookService, forcePauseSelector);
  const isVisible = usePageVisibility()
  const { send } = orderbookService;

  useEffect(() => {
    let event:OrderbookMachineEvent | undefined;
    if(!isVisible) {
      event = { type: 'PAUSE', forced: true };
    }
    else {
      // connect 
      if(isIdle) {event = { type: 'CONNECT' };} 
      // 3,2,1 liftoff
      else if(isPaused && (!isInitialized || forcePause)) { event = { type: 'START' }}
    }       
    if(event) { send(event); }

  },[send, isIdle, isPaused, isInitialized, isVisible, forcePause])

  return (<></>);
}  

export default OrderbookComm;