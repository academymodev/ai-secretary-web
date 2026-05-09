import Providers from './providers'
import './globals.css'

export const metadata = {
  title: 'Modev Secretary',
  description: 'Your AI-powered personal assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
