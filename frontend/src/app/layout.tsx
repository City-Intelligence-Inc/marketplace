import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'City Secretary - Keep Up With Latest Research',
  description: 'Research papers and news as engaging podcast summaries delivered to your inbox.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
