import React, { createContext } from 'react';
import { useInterpret } from '@xstate/react';
import machine, { OrderbookService } from '../machines/OrderbookMachine';

interface OrderbookProviderProps{}

export const OrderbookContext = createContext<OrderbookService>(null!);

export const OrderbookProvider:React.FC<OrderbookProviderProps> = (props) => {
  const orderbookService = useInterpret(machine);

  return (
    <OrderbookContext.Provider value={ orderbookService }>
      {props.children}
    </OrderbookContext.Provider>
  );
};