import { Order, OrderbookData, Orders, RawOrder, Spread } from '../types'

const clear = (data:Array<RawOrder>):Array<RawOrder> => {
  return data?.filter(rowOrder => rowOrder[1]);
}


const sortByPriceAscending = (data:Array<RawOrder>):Array<RawOrder> => {
  return data?.sort((a:RawOrder, b:RawOrder) => a[0] - b[0]);
}


const sortByPriceDescending = (data:Array<RawOrder>):Array<RawOrder> => {
  return data?.sort((a:RawOrder, b:RawOrder) => b[0] - a[0]);
}


const addTotals = (data: Array<RawOrder>): Array<Order> => {
  
  return data?.reduce( (acc:Array<Order>, current:RawOrder ) => {
    const last:Order = acc.length > 0 ? acc[acc.length - 1] : { price: 0, size: 0, total: 0};
    const newOrder:Order = {
      price: current[0],
      size: current[1],
      total: last.total + current[1]
    }  
    return [...acc, newOrder];
  }, [] as Array<Order>)
}


const calculateSpread = (ask:Order, bid:Order) => {
  const value = ask.price - bid.price;
  const percent = +(value * 100 / ask.price).toFixed(2);

  return {
    value, 
    percent
  }
}


export const createOrderbook = (data:Orders):OrderbookData => {
  const asks = data?.asks || [];
  const bids = data?.bids || [];
  
  let a = sortByPriceAscending(clear(asks));
  let askOrders = addTotals(a);

  let b = sortByPriceDescending(clear(bids));
  let bidOrders = addTotals(b);
  
  const spread:Spread = askOrders.length > 0 && bidOrders.length > 0 
              ? calculateSpread(askOrders[0], bidOrders[0]) 
              : { value: 0, percent: 0};

  return {
    raw: {
      asks,
      bids,
    },
    asks: askOrders,
    bids: bidOrders,
    spread
  }

}


export const updateOrderbook = (od: OrderbookData, deltas: Orders) => {
  const asks = deltas?.asks || [];
  const bids = deltas?.bids || [];

  const odAsks = [...od.raw.asks];
  const odBids = [...od.raw.bids];

  const updatedAsks= odAsks.map(odAsk=> {
   const index = asks.findIndex(x => x[0] === odAsk[0]);
   return index === -1 ? odAsk : asks[index]
  })

  const updatedBids= odBids.map(odBid=> {
    const index = bids.findIndex(x => x[0] === odBid[0]);
    return index === -1 ? odBid : bids[index]
   })
 
  return createOrderbook({asks: updatedAsks, bids: updatedBids})
}


export const isSlowDevice = () => {
  let cpus = 1;
  if('hardwareConcurrency' in navigator) {
    cpus = navigator.hardwareConcurrency;
  }
  return cpus < 3;
}