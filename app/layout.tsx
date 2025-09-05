import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SessionProvider from "@/components/providers/SessionProvider"
import { Toaster} from 'sonner'
import { Dialog } from "@/components/ui/dialog"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gana con Neomar - La Mejor Experiencia en Rifas Online",
  description: "Participa en rifas emocionantes con premios increíbles. Compra tus números de forma fácil y segura!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning={true}>
      <head>
      <link rel="icon" href="/logo.ico" type="image/x-icon"/>
      </head>
      <body         suppressHydrationWarning
 className={`${inter.className} bg-black text-white min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <Dialog>
          {children}
          </Dialog>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
