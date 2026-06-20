import Head from 'next/head'
import Header from '../components/Header'
import HomeFeed from '../components/HomeFeed'
import { supabase } from '../lib/supabase'

export default function Home({ initialProducts, total }) {
  return (
    <>
      <Head>
        <title>FindVibe — Affordable Aesthetic Finds</title>
        <meta name="description" content="Affordable aesthetic finds for a home that feels like you."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <Header/>
      <main>
        <HomeFeed initialProducts={initialProducts} total={total}/>
      </main>
    </>
  )
}

export async function getStaticProps() {
  try {
    const { data, error, count } = await supabase
      .from('products').select('*', { count: 'exact' }).eq('active', true)
      .order('orders', { ascending: false }).range(0, 11)
    if (error) throw error
    return { props: { initialProducts: data || [], total: count || 0 }, revalidate: 60 }
  } catch (e) {
    console.error('getStaticProps error:', e.message)
    return { props: { initialProducts: [], total: 0 }, revalidate: 30 }
  }
}
