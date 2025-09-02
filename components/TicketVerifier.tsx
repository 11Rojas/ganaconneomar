"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Ticket, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react"
import Image from "next/image"

interface TicketData {
  _id: string
  raffleId: {
    _id: string
    title: string
    description: string
    image?: string
    drawDate: string
    status: string
  }
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  paymentData: {
    email?: string
    phone?: string
    reference?: string
  }
}

interface VerificationResponse {
  tickets: TicketData[]
  count: number
  message?: string
}

export default function TicketVerifier() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError("")
    setHasSearched(true)

    try {
      const response = await fetch(`/api/verify?email=${encodeURIComponent(email)}`)
      const data: VerificationResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar tickets")
      }

      setTickets(data.tickets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar tickets")
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>
      case "pending":
        return <Badge className="bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case "rejected":
        return <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>
    }
  }

  const getRaffleStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-[#febd59] text-black">Activa</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Finalizada</Badge>
      case "cancelled":
        return <Badge className="bg-red-600 text-white">Cancelada</Badge>
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#febd59] to-[#e6a84f] rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Verificador de Tickets</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Ingresa tu email para verificar tus tickets comprados
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-gray-900 border-[#febd59]/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Buscar Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white text-sm">
                  Email de compra
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading || !email.trim()} 
                className="w-full btn-gold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verificar Tickets
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            {tickets.length === 0 ? (
              <Card className="bg-gray-900 border-[#febd59]/20">
                <CardContent className="text-center py-8">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No se encontraron tickets</h3>
                  <p className="text-gray-400">
                    No se encontraron tickets asociados a este email. Verifica que el email sea correcto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Tickets Encontrados: {tickets.length}
                  </h2>
                  <p className="text-gray-400">Email: {email}</p>
                </div>

                <div className="grid gap-6">
                  {tickets.map((ticket) => (
                    <Card key={ticket._id} className="bg-gray-900 border-[#febd59]/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2">
                              {ticket.raffleId.title}
                            </CardTitle>
                            <p className="text-gray-400 text-sm mb-3">
                              {ticket.raffleId.description}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(ticket.status)}
                            {getRaffleStatusBadge(ticket.raffleId.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Raffle Image */}
                          {ticket.raffleId.image && (
                            <div className="relative">
                              <Image
                                src={ticket.raffleId.image}
                                alt={ticket.raffleId.title}
                                width={300}
                                height={200}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Ticket Details */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-white font-semibold mb-2">Números del Ticket:</h4>
                              <div className="flex flex-wrap gap-2">
                                {ticket.numbers.map((number, index) => (
                                  <span
                                    key={index}
                                    className="bg-[#febd59] text-black px-3 py-1 rounded-full text-sm font-semibold"
                                  >
                                    {number.toString().padStart(2, '0')}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Total Pagado:</span>
                                <p className="text-white font-semibold">
                                  <DollarSign className="w-4 h-4 inline mr-1" />
                                  ${ticket.totalAmount.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Método de Pago:</span>
                                <p className="text-white font-semibold capitalize">
                                  {ticket.paymentMethod}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Fecha de Compra:</span>
                                <p className="text-white font-semibold">
                                  <Calendar className="w-4 h-4 inline mr-1" />
                                  {formatDate(ticket.createdAt)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-400">Fecha del Sorteo:</span>
                                <p className="text-white font-semibold">
                                  <Calendar className="w-4 h-4 inline mr-1" />
                                  {formatDate(ticket.raffleId.drawDate)}
                                </p>
                              </div>
                            </div>

                            {ticket.paymentData.reference && (
                              <div>
                                <span className="text-gray-400">Referencia de Pago:</span>
                                <p className="text-white font-semibold">
                                  {ticket.paymentData.reference}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}