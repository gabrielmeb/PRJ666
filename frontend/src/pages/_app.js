import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <main className="min-h-screen">
      <Component {...pageProps} />
    </main>
  )
}