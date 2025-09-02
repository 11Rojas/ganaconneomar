"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-yellow-400/30 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo mejorado - Corregido: envolver solo el contenido clickeable1 */}
          <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 ">
                  <img src="/logo.png"/>
                </div>
              </div>
            <Link href="/" className="group flex items-center">
              <span className="ml-3 text-2xl font-bold gradient-text">Gana con Neomar</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-[#febd59] transition-all duration-300 font-medium hover:scale-105"
            >
              Inicio
            </Link>
            <Link
              href="/verify"
              className="text-white hover:text-[#febd59] transition-all duration-300 font-medium hover:scale-105"
            >
              Verificar Tickets
            </Link>
          </div>

      

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-[#febd59]/30 bg-black/50 backdrop-blur-md rounded-b-lg">
              <Link
                href="/"
                className="block px-4 py-3 text-white hover:text-[#febd59] hover:bg-[#febd59]/10 transition-all duration-300 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/verify"
                className="block px-4 py-3 text-white hover:text-[#febd59] hover:bg-[#febd59]/10 transition-all duration-300 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Verificar Tickets
              </Link>
       
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
