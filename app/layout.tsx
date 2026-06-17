import type { Metadata } from "next"
import "./globals.css"
import AppShell from "./AppShell"

export const metadata: Metadata = {
  title: "Krono Inventario",
  description: "Sistema de inventario Krono Pro",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}