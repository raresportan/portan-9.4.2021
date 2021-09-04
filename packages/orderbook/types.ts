export type RawOrder = [number, number];
export type Order = {
  price: number, 
  size: number, 
  total: number
};

export type Orders = {
  asks:Array<RawOrder>,
  bids:Array<RawOrder>
}

export type Spread = {
  value: number,
  percent: number
}

export type OrderbookData = {
  raw: Orders,
  asks: Array<Order>,
  bids: Array<Order>,
  spread: Spread
}