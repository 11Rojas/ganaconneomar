"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutDashboard, Trophy, CreditCard, DollarSign, BarChart3, Home, Sparkles, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "raffles", label: "Gestión de Rifas", icon: Trophy },
    { id: "payments", label: "Pagos", icon: CreditCard },
    { id: "exchange", label: "Tasa de Cambio", icon: DollarSign },
  ]

  const handleMenuClick = (viewId: string) => {
    onViewChange(viewId)
    // Cerrar el sidebar en móvil después de hacer clic
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-900 border border-yellow-400/20 hover:bg-gray-800 text-white"
          size="sm"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed sm:relative top-0 left-0 h-full z-40
        bg-gray-900 border-r border-yellow-400/20
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        w-64
      `}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-yellow-400/20">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold gradient-text">Administrador</h1>
              <p className="text-xs sm:text-sm text-gray-400">Panel Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-700">
            <Link
              href="/"
              className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 text-sm sm:text-base"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">Volver al Sitio</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
