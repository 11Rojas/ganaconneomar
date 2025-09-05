"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Users } from "lucide-react"

interface TopBuyer {
  email: string
  totalNumbers: number
  totalPurchases: number
  totalAmount: number
  name: string
  phone?: string
}

export default function TopBuyers() {
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopBuyers = async () => {
      try {
        const response = await fetch("/api/purchases/tops")
        if (response.ok) {
          const data = await response.json()
          setTopBuyers(data.topBuyers?.slice(0, 3) || [])
        }
      } catch (error) {
        console.error("Error fetching top buyers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopBuyers()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Users className="w-6 h-6 text-gray-500" />
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 2:
        return "bg-gradient-to-r from-amber-500 to-amber-700"
      default:
        return "bg-gray-600"
    }
  }

  const maskEmail = (email: string | undefined) => {
    if (!email || email.trim() === "") return "Usuario"
    const [username, domain] = email.split("@")
    if (username.length <= 2) return email
    return `${username.substring(0, 2)}***@${domain}`
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-[#febd59]/20">
        <CardHeader>
          <CardTitle className="text-white text-center">🏆 Top 3 Compradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#febd59] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topBuyers.length === 0) {
    return (
      <Card className="bg-gray-900 border-[#febd59]/20">
        <CardHeader>
          <CardTitle className="text-white text-center">🏆 Top 3 Compradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Aún no hay compradores</p>
            <p className="text-gray-500 text-sm">¡Sé el primero en comprar!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-[#febd59]/20">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-[#febd59]" />
          Top 3 Compradores
        </CardTitle>
      </CardHeader>
      <CardContent>
                 <div className="space-y-4">
           {topBuyers
             .filter(buyer => buyer && buyer.name) // Filtrar compradores válidos
             .map((buyer, index) => (
             <div
               key={buyer.email || `buyer-${index}`}
               className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(index)} text-white`}
             >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                  {getRankIcon(index)}
                </div>
                                 <div>
                   <p className="font-semibold">
                     {buyer.name || "Usuario"}
                   </p>
                   <p className="text-sm opacity-90">
                     {buyer.totalNumbers} números • {buyer.totalPurchases} compras
                   </p>
                 </div>
              </div>
                             <div className="text-right">
                 <Badge className="bg-white/20 text-white border-0">
                   #{index + 1}
                 </Badge>
               </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¡Únete a la competencia y compra tus tickets!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
