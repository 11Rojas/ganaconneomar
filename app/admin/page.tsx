"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminDashboard from "@/components/admin/AdminDashboard"
import RaffleManagement from "@/components/admin/RaffleManagement"
import PaymentManagement from "@/components/admin/PaymentManagement"
import ExchangeRateManager from "@/components/admin/ExchangeRateManager"
import Analytics from "@/components/admin/Analytics"

type AdminView = "dashboard" | "raffles" | "payments" | "exchange" | "analytics"

// Extender el tipo de sesión para incluir el rol
interface ExtendedSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const router = useRouter()

  useEffect(() => {
    console.log("=== DEBUG INFO ===")
    console.log("Session status:", status)
    console.log("Session data:", session)
    console.log("User role:", session?.user?.role)
    console.log("Is admin check:", session?.user?.role === "admin")
    
    if (status === "loading") {
      console.log("Still loading...")
      return
    }

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to login")
      router.replace("/admin/login")
      return
    }

    if (session?.user?.role !== "admin") {
      console.log("User is not admin, redirecting to login")
      router.replace("/admin/login")
      return
    }

    console.log("User is authenticated and is admin - allowing access")
  }, [session, status, router])

  // Mostrar loading mientras verifica autenticación
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#febd59] mx-auto mb-4"></div>
          <p>Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar mensaje de redirección
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>No estás autenticado. Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  // Si no es admin, mostrar mensaje de acceso denegado
  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Acceso denegado. Solo administradores pueden acceder.</p>
          <p className="text-sm text-gray-400 mt-2">Rol actual: {session?.user?.role || "No definido"}</p>
        </div>
      </div>
    )
  }

  // Si llegamos aquí, el usuario está autenticado y es admin
  console.log("Rendering admin panel for user:", session.user.email)

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <AdminDashboard />
      case "raffles":
        return <RaffleManagement />
      case "payments":
        return <PaymentManagement />
      case "exchange":
        return <ExchangeRateManager />
      case "analytics":
        return <Analytics />
      default:
        return <AdminDashboard />
    }
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view as AdminView)
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  )
}
