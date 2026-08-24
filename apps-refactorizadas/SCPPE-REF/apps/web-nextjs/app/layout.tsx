import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "Planificación Eléctrica - POA",
  description: "Sistema de gestión de Planes Operativos Anuales del Sector Eléctrico Nacional",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
