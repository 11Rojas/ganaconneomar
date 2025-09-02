"use client"

import { useState, useEffect } from "react"
import PurchaseModal from "./PurchaseModal"
import type { Raffle } from "@/lib/types"
import { Instagram, Facebook } from "lucide-react"
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
    <section id="rifas-destacadas" className="py-16 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
    <div className="max-w-7xl mx-auto">
      {/* Sección de Redes Sociales */}
      <div className="flex justify-center gap-4 mb-8">
        <a href="https://www.instagram.com/Neomarng" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
          <Instagram className="w-14 h-14 text-pink-500" />
        </a>
        <a href="https://www.facebook.com/neomargregoriotv" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
          <Facebook className="w-14 h-14 text-blue-500" />
        </a>
        <a href="https://www.tiktok.com/@neomar.gregorio" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
          <TikTok className="w-14 h-14 text-blue-500" />
        </a>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Rifas <span className="gradient-text">Destacadas</span>
        </h2>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
          No te pierdas estas increíbles oportunidades de ganar premios espectaculares
        </p>
      </div>

      {raffles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No hay rifas activas en este momento</p>
          <p className="text-gray-500">Vuelve más tarde para ver nuevas rifas</p>
        </div>
      ) : (
        <>

          {/* Listado de rifas */}
          <div className="grid grid-cols-1 gap-8 w-full">
            {raffles.map((raffle) => (
              <div key={raffle._id} className="w-full">
                <PurchaseModal raffle={raffle} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>


  </section>
  )
}
