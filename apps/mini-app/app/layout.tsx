import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Linka — Discover, Chat, and Pay on Base',
  description: 'Conversations that close onchain. Discover vendors, chat naturally, and pay with a custodial wallet.',
  openGraph: {
    title: 'Linka — Discover, Chat, and Pay on Base',
    description: 'Conversations that close onchain. Discover vendors, chat naturally, and pay with a custodial wallet.',
    images: ['/linka-hero.png'],
  },
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

