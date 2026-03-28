import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'RivalScope — AI Competitive Intelligence',
  description: 'Instant AI-powered competitive analysis. See how your SEO stacks up against any competitor in seconds.',
  openGraph: {
    title: 'RivalScope — AI Competitive Intelligence',
    description: 'Keyword gaps, traffic comparison, and strategic recommendations powered by DataForSEO + Claude AI.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
