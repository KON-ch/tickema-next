import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth"
import type { AppProps } from 'next/app'
import { useSession } from "next-auth/react"
import LoginButton from '../components/LoginButton'

function SessionVerifier({ children }) {
  const { status } = useSession()

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (status === "unauthenticated") {
    return (
      <LoginButton />
    )
  }

  return children
}

function MyApp({ Component, pageProps }: AppProps<{session: Session}>) {
  return (
    <SessionProvider session={pageProps.session}>
      <SessionVerifier>
        <Component {...pageProps} />
      </SessionVerifier>
    </SessionProvider>
  )
}

export default MyApp
