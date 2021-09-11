import React from 'react';
import { OrderbookProvider } from '../contexts/OrderbookContext';
import OrderbookComm from './OrderbookComm';
import OrderbookDisplay from './OrderbookDisplay';

const Orderbook = () => (
    <OrderbookProvider>
      <OrderbookComm/>   
      <OrderbookDisplay/>   
    </OrderbookProvider>
);  

export default Orderbook;