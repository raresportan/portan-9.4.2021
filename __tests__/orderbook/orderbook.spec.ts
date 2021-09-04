import { createOrderbook, updateOrderbook } from '../../packages/orderbook/machines/domain-functions';
import { OrderbookData, Orders } from '../../packages/orderbook/types';

describe('Orderbook data processing', () => {

  it('clears orders with size 0', () => {
    const orders:Orders = {
      asks: [[100, 0], [200, 10]],
      bids: [[123, 123], [1, 0], [0, 1]]
    }

    const result:OrderbookData = createOrderbook(orders);

    expect(result).toBeDefined();
    expect(result.asks).toBeDefined();
    expect(result.asks.length).toBe(1);
    expect(result.bids).toBeDefined();
    expect(result.bids.length).toBe(2);
  })


  it('sorts the orders by price', () => {
    const orders:Orders = {
      asks: [[100, 220], [200, 10], [99, 11], [5, 5], [1000, 2]],
      bids: [[123, 123], [1, 10], [321, 19]]
    }

    const result:OrderbookData = createOrderbook(orders);
    const firstBid = result.bids[0];
    expect(firstBid.price).toBe(321);
    expect(result.bids[1].price).toBe(123);

    const firstAsk = result.asks[0]; 
    expect(firstAsk.price).toBe(5);
    expect(result.asks[1].price).toBe(99);
  })  


  it('calculates the totals', () => {
    const orders:Orders = {
      asks: [[100, 220], [200, 10], [99, 11], [5, 5], [1000, 2]],
      bids: [[123, 123], [1, 10], [321, 19]]
    }

    const result:OrderbookData = createOrderbook(orders);
    const firstBid = result.bids[0];
    expect(firstBid.total).toBe(19);
    expect(result.bids[1].total).toBe(142);
    expect(result.bids[2].total).toBe(152);

    const firstAsk = result.asks[0]; 
    expect(firstAsk.total).toBe(5);
    expect(result.asks[1].total).toBe(16);
    expect(result.asks[2].total).toBe(236);
  })  


  it('calculates the spread', () => {
    const orders:Orders = {
      asks: [[34079.50, 3356], [34080.00, 23999], [34080.50, 10000]],
      bids: [[34062.50, 1200], [34062.00, 12251], [34059.50, 1878]]
    }

    const result:OrderbookData = createOrderbook(orders);

    const firstBid = result.bids[0];
    expect(firstBid.price).toBe(34062.5);
    expect(firstBid.total).toBe(1200);

    expect(result.bids[1].price).toBe(34062);
    expect(result.bids[1].total).toBe(13451);

    const firstAsk = result.asks[0]; 
    expect(firstAsk.price).toBe(34079.5);
    expect(firstAsk.total).toBe(3356);

    expect(result.asks[1].price).toBe(34080);
    expect(result.asks[1].total).toBe(27355);

    const spread = result.spread;
    expect(spread.value).toBe(17);
    expect(spread.percent).toBe(0.05);
  })  


  it('calculates the spread with new data', () => {
    const orders:Orders = {
      asks: [[34074.00, 1728], [34080.00, 23999], [34080.50, 14999]],
      bids: [[34061.00, 1958], [34060.00, 12944], [34056.50, 3216]]
    }

    const result:OrderbookData = createOrderbook(orders);
    const spread = result.spread;
    expect(spread.value).toBe(13);
    expect(spread.percent).toBe(0.04);
  })  


  it('updates the orderbook', () => {
    const orders:Orders = {
      asks: [[34074.00, 1728], [34080.00, 23999], [34080.50, 14999]],
      bids: [[34061.00, 1958], [34060.00, 12944], [34056.50, 3216]]
    }

    const result:OrderbookData = createOrderbook(orders);
    let deltas:Orders = {
      asks: [[34080.00, 100]],
      bids: [[34061.00, 200]]
    }
    let newOrderbook = updateOrderbook(result, deltas);
    expect(newOrderbook.asks[1].size).toBe(100);
    expect(newOrderbook.bids[0].size).toBe(200);

    deltas = {
      asks: [[34074.00, 0]],
      bids: [[34056.50, 0]]
    }
    newOrderbook = updateOrderbook(result, deltas);
    expect(newOrderbook.asks.length).toBe(2);
    expect(newOrderbook.bids.length).toBe(2);

  })  

}) 