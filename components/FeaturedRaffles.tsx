"use client"

import { useState, useEffect } from "react"
import PurchaseModal from "./PurchaseModal"
import type { Raffle } from "@/lib/types"
import { Instagram, Facebook, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import TikTok from "./Tiktok"

export default function FeaturedRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [topBuyers, setTopBuyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Obtener rifas activas
        const rafflesResponse = await fetch("/api/raffles/active")
        if (!rafflesResponse.ok) throw new Error("Error al cargar las rifas")
        const rafflesData = await rafflesResponse.json()
        setRaffles(rafflesData)

        // 2. Solo obtener top compradores si hay rifas activas
        if (rafflesData.length > 0) {
          const topBuyersResponse = await fetch("/api/purchases/tops")
          if (!topBuyersResponse.ok) throw new Error("Error al cargar top compradores")
          const topBuyersData = await topBuyersResponse.json()
          setTopBuyers(topBuyersData.topBuyers || [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])



  if (loading) {
    return (
      <section id="rifas-destacadas" className="py-16 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Rifas <span className="gradient-text">Destacadas</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
              No te pierdas estas increíbles oportunidades de ganar premios espectaculares
            </p>
          </div>
          
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <span className="ml-3 text-white">Cargando rifas...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="rifas-destacadas" className="py-16 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Rifas <span className="text-[#213502]">Destacadas</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
              No te pierdas estas increíbles oportunidades de ganar premios espectaculares
            </p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Error al cargar las rifas</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-gold"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </section>
    )
  }

    return (
    <section id="rifas-destacadas" className="bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Image Section */}
      {raffles.length > 0 && (
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
          <Image
            src={raffles[0].image || "/placeholder.svg"}
            alt={raffles[0].title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                {raffles[0].title}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mb-6">
                {raffles[0].description}
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-[#febd59] text-black text-lg px-4 py-2">
                  {raffles[0].status === "active" ? "Activa" : raffles[0].status === "completed" ? "Finalizada" : "Cancelada"}
                </Badge>
                <span className="text-white text-lg">
                  <DollarSign className="w-5 h-5 inline mr-1" />
                  ${raffles[0].ticketPrice} por ticket
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {raffles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No hay rifas activas en este momento</p>
              <p className="text-gray-500">Vuelve más tarde para ver nuevas rifas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 w-full">
              {raffles.map((raffle) => (
                <div key={raffle._id} className="w-full">
                  <PurchaseModal raffle={raffle} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
