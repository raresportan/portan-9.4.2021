import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Orderbook = dynamic(() => import('../packages/orderbook/components/Orderbook'), { ssr: false });

const Home: NextPage = () => {
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Orderbook</title>
        <meta name="description" content="Coin Orderbook" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
          Order Book
      </header>
      <main className={styles.main}>
        <Orderbook />
      </main>  
    </div>
  )
}

export default Home
