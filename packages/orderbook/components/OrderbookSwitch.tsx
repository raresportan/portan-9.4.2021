import { useSelector } from '@xstate/react';
import React, { useContext, useEffect } from 'react';
import { State } from 'xstate';
import { OrderbookContext } from '../contexts/OrderbookContext';
import { OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState } from '../machines/OrderbookMachine';
import styles from '../styles/Orderbook.module.css';

// feed selector
const feedSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.context.feed;

// forced selector
const forcePauseSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.context.forcePause;

// machine paused state selector
const pausedSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) =>  state.matches('connected.paused');


/**
 * Component that renders the "Toggle feed" button.
 */
const OrderbookSwitch = () => {
  const orderbookService = useContext(OrderbookContext);
  const obFeed = useSelector(orderbookService, feedSelector);
  const isPaused = useSelector(orderbookService, pausedSelector);
  const forcePause = useSelector(orderbookService, forcePauseSelector);
  const { send } = orderbookService;

  const toggle = () => {
    send({type: 'PAUSE', forced: false});
  }

  useEffect(() => {
    if(isPaused && !forcePause) {
      // switch feed
      send({type: 'SWITCH', feed: obFeed === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD'});
      send({type: 'START'});
    }  
  },[send, obFeed, isPaused, forcePause])
  
  return (
    <div className={styles.switch}>
      <button onClick={toggle}>Toggle feed</button>
    </div>
  );
}  

export default OrderbookSwitch;