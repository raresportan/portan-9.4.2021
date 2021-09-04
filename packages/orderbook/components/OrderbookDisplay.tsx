import React, { useContext } from 'react';
import { OrderbookContext } from '../contexts/OrderbookContext';
import { OrderbookData } from '../types';
import OrderbookTable from './OrderbookTable';
import styles from '../styles/Orderbook.module.css';
import OrderbookSwitch from './OrderbookSwitch';
import { OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState } from '../machines/OrderbookMachine';
import { useSelector } from '@xstate/react';
import { State } from 'xstate';

// spread value formatter
const spreadFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits:1 });

// machine data selector
const dataSelector = (state:State<OrderbookMachineContext, OrderbookMachineEvent, OrderbookMachineState, any>) => state.context.data;

/**
 * Component that renders all the Order book UI: the two tables and the toggle button.
 * If there is no data, it doesn't render anything. 
 */
const OrderbookDisplay = () => {
  const orderbookService = useContext(OrderbookContext);
  const obData = useSelector(orderbookService, dataSelector) as OrderbookData;

  const asks = obData?.asks;
  const bids = obData?.bids;
  const spread = obData?.spread;

  const spreadLabel = spread? `Spread: ${spreadFormatter.format(spread.value)} (${spread.percent}%)` : '';

  // diffent wrapper classes when we have data or we don't
  const wrapperClasses = asks && bids ? styles.wrapper+' '+styles.wrapperloaded :  styles.wrapper;

  // passed to tables for depth graph rendering
  const max = asks && bids ? Math.max(asks[asks.length - 1]?.total, bids[bids.length - 1]?.total): 1;

  const container = asks && bids 
      ? <>
          <div className={styles.container}>
              <OrderbookTable orders={bids} className={styles.bids} max={max}/>
              <div className={styles.spread}>{spreadLabel}</div>
              <OrderbookTable orders={asks} className={styles.asks} max={max}/>
            </div>
            <OrderbookSwitch/>
        </>
      : <></>

  return <div className={wrapperClasses}>{container}</div>  
}

export default OrderbookDisplay;