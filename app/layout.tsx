import React from 'react'

export const metadata = {
  title: 'Enhanced Document Reader',
  description: 'A powerful document reader and analyzer',
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