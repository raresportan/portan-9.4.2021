import React from 'react';
import { Order } from '../types';

type OrderbookTableProps = {
  orders: Array<Order>,
  className: string,
  max: number
}

// price formatter
const priceFormatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});

// size and total number formatter
const formatter = new Intl.NumberFormat();

/**
 * Renders a table with orders.
 * For each order, the price, size, and total is displayed.
 * 
 * The depth graph is rendered by setting linear gradient backgrounds to table cells.
 * Each linear gradient has two stops, one transparent and one not.
 * The gradient direction and color is controlled from CSS with CSS variables.
 * 
 * @param props 
 */
const OrderbookTable = (props: OrderbookTableProps) => {
  const { orders = [], max } = props;

  const cells = orders.map(order => {
    // unique id of a cell
    const key = props.className+'x'+order.price+'x'+order.size+'x'+order.total;

    // row background size
    const bgSize = 100 - order.total * 100 / max;

    return (
      <div key={key} 
           style={{ background: `linear-gradient( var(--bg-direction) , transparent ${bgSize}%,  var(--bg-color) ${bgSize}%)`}}>
        <span>{priceFormatter.format(order.price)}</span>
        <span>{formatter.format(order.size)}</span>
        <span>{formatter.format(order.total)}</span>
      </div>
    )
  })

  return (
    <section className={props.className}>
      <header>
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </header>
      <article>
      {cells}
      </article>
    </section>
  )  

}

export default OrderbookTable;