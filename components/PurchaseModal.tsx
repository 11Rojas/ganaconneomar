"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import CountdownTimer from "./CountdownTimer"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { DollarSign, Smartphone, CreditCard, Upload, Check } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DialogHeader } from "./ui/dialog"

type PaymentMethod = "zelle" | "pago-movil" | "pago-movil2"

interface PaymentMethodData {
  email?: string
  phone?: string
  name?: string
  ci?: string
  reference?: string
  notes?: string
}

interface Raffle {
  _id: string
  title: string
  description: string
  image?: string
  ticketPrice: number
  totalNumbers: number
  soldNumbers?: number[]
  drawDate: string
  status: "active" | "completed" | "cancelled"
}

interface PaymentMethodConfig {
  id: PaymentMethod
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  currency: "USD" | "VES" | "CLP"
  fields: {
    name: keyof PaymentMethodData
    label: string
    required: boolean
  }[]
  accountDetails: Record<string, string>
}

const paymentMethods: PaymentMethodConfig[] = [
  {
    id: "pago-movil2",
    name: "Pago Móvil",
    icon: Smartphone,
    description: "Pago en Bolívares via Pago Móvil Venezuela",
    currency: "VES",
    fields: [
      { name: "name", label: "Nombre completo", required: true},
      { name: "email", label: "Email", required: true},
      { name: "phone", label: "Tu Teléfono", required: true },
      { name: "reference", label: "Número de Referencia", required: true }
    ],
    accountDetails: {
      telefono: "04120441789",
      ci: "23613150",
      banco: "Banco de Venezuela"
    }
  },
]

export default function RaffleCard({ raffle }: { raffle: Raffle }) {
  const { data: session } = useSession()
  const [soldPercentage, setSoldPercentage] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pago-movil')
  const [quantity, setQuantity] = useState(1)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [paymentData, setPaymentData] = useState<Record<PaymentMethod, PaymentMethodData>>({
    zelle: {},
    "pago-movil": {},
    "pago-movil2": {}
  })
  const [exchangeRate, setExchangeRate] = useState({
    USD: 1,
    VES: 36,
    CLP: 1800
  })

  useEffect(() => {
    const sold = raffle.soldNumbers?.length || 0
    const total = raffle.totalNumbers
    setSoldPercentage((sold / total) * 100)
  }, [raffle.soldNumbers, raffle.totalNumbers])

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("/api/exchange-rate")
        const data = await response.json()
        setExchangeRate(prev => ({
          ...prev,
          VES: data.rate || 36
        }))
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
      }
    }
    fetchExchangeRate()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handlePaymentDataChange = (method: PaymentMethod, field: keyof PaymentMethodData, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setReceipt(file)
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
  
    try {
      const formData = new FormData()
      formData.append("raffleId", raffle._id)
      formData.append("quantity", quantity.toString())
      formData.append("paymentMethod", selectedPayment)
      formData.append("paymentData", JSON.stringify(paymentData[selectedPayment] || {}))
      formData.append("receipt", receipt)
  
      const response = await fetch("/api/purchases", {
        method: "POST",
        body: formData,
      })
      
      const result = await response.json()

      
      if (!response.ok) {
        // Si hay un error en la respuesta, lanzamos el mensaje del servidor
        throw new Error(result.error)
      }

   // Mostrar modal de éxito en lugar del toast
   setShowSuccessModal(true)
    } catch (error) {
      console.error("Error:", error)
      // Mostramos el mensaje de error específico del servidor
      alert(error instanceof Error ? error.message : "Error al procesar la compra")
    } finally {
      setIsSubmitting(false)
    }
  }
  const currentMethod = selectedPayment ? paymentMethods.find(m => m.id === selectedPayment) : null
  const totalUSD = quantity * raffle.ticketPrice
  const totalVES = totalUSD * exchangeRate.VES
  const totalCLP = totalUSD * exchangeRate.CLP

  const addTickets = (amount: number) => {
    setQuantity(prev => Math.min(500, prev + amount))
  }

  return (
    <div className=" mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="relative rounded-lg overflow-hidden">
        <Image
          src={raffle.image || "/placeholder.svg"}
          alt={raffle.title}
          width={800}
          height={400}
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h2 className="text-2xl font-bold text-white">{raffle.title}</h2>
          <p className="text-gray-300">{raffle.description}</p>
        </div>
        <Badge className="absolute top-3 right-3 bg-[#febd59] text-black">
          {raffle.status === "active" ? "Activa" : raffle.status === "completed" ? "Finalizada" : "Cancelada"}
        </Badge>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px] text-center bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-black font-bold text-center">
              Pago exitoso
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <p className="text-black">
              Gracias por tu compra
            </p>
            <p className="text-gray-500 text-sm">
              Pronto verificaremos tu pago y te enviaremos los números asignados.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#023429] hover:bg-[#034a3d] px-8 text-white"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>


   {/* Ticket Quantity Selector - Improved */}
<div className="space-y-2">
  <Label className="text-lg">¿Cuántos tickets quieres?</Label>
  <div className="flex items-center gap-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
      className="h-11 w-11 text-2xl bg-gray-800 border-gray-600 hover:bg-gray-700"
      disabled={quantity <= 1}
    >
      -
    </Button>
    
    <Input
      type="number"
      min="1"
      max="500"
      value={quantity}
      onChange={(e) => {
        const value = parseInt(e.target.value) || 1
        setQuantity(Math.max(1, Math.min(500, value)))
      }}
      className="text-center text-lg py-2 h-11 flex-1"
    />
    
    <Button
      type="button"
      variant="outline"
      onClick={() => setQuantity(prev => Math.min(500, prev + 1))}
      className="h-11 w-11 text-2xl bg-gray-800 border-gray-600 hover:bg-gray-700"
      disabled={quantity >= 500}
    >
      +
    </Button>
  </div>
  <p className="text-sm text-gray-500 text-center">
    Máximo 500 tickets por compra
  </p>
</div>
      {/* Payment Method Selection */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold">¿A dónde quieres transferir?</h3>
        <p className="text-gray-500">Selecciona una cuenta</p>
        
        <div className="grid grid-cols-1 gap-4">
  {paymentMethods.map((method) => (
    <button
      key={method.id}
      type="button"
      onClick={() => setSelectedPayment(method.id)}
      className={`p-4 border rounded-lg flex flex-col items-center ${
        selectedPayment === method.id ? 'border-[#febd59] bg-black' : 'border-gray-200'
      }`}
    >
      {method.id === 'zelle' ? (
        <Image 
          src="/zelle.png" 
          alt="Zelle" 
          width={80} 
          height={40} 
          className="mb-2"
        />
      ) : (
        <Image 
          src="/bancodevenezuela.png" 
          alt="Banco de Venezuela" 
          width={80} 
          height={40} 
          className="mb-2"
        />
      )}
      <span className="font-medium">{method.name}</span>
    </button>
  ))}
</div>
      </div>

      {/* Payment Details */}
      {currentMethod && (
        <div className="space-y-4">
          <div className="bg-black-100 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Datos para transferencia:</h4>
            {Object.entries(currentMethod.accountDetails).map(([key, value]) => (
              <p key={key} className="text-sm">
                <span className="font-medium capitalize">{key}:</span> {value}
              </p>
            ))}
            <p className="mt-2 font-medium">
              Monto a pagar: {currentMethod.currency === "USD" ? `USD ${totalUSD.toFixed(2)}` : 
                            currentMethod.currency === "VES" ? `BS ${totalVES.toLocaleString("es-VE")}` : 
                            `CLP ${totalCLP.toLocaleString("es-VE")}`}
            </p>
          </div>

          <Button variant="outline" className="w-full  bg-[#023429] hover:bg-[#034a3d] text-white">
            Conversión: 1$ = {exchangeRate.VES} Bs (Tasa actual)
          </Button>
        </div>
      )}

      {/* Transfer Form */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">¿Ya transferiste?</h3>
        <p className="text-gray-500">Llena este formulario</p>

        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          {currentMethod?.fields.map((field) => (
            <div key={field.name}>
              <Label>{field.label} {field.required && '*'}</Label>
              <Input
                type={field.name === "phone" ? "tel" : 
                    field.name === "email" ? "email" : "text"}
                value={paymentData[currentMethod.id]?.[field.name] || ""}
                onChange={(e) => handlePaymentDataChange(currentMethod.id, field.name, e.target.value)}
                defaultValue={0}
                required={field.required}
              />
            </div>
          ))}

          <div>
            <Label>Comprobante de pago *</Label>
            <div className="mt-1">
            <input
  type="file"
  accept="image/png, image/jpg, image/jpeg"
  onChange={handleFileUpload}
  className="hidden"
  id={`receipt-${raffle._id}`}
  required
/>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`receipt-${raffle._id}`)?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {receipt ? receipt.name : "Subir Comprobante"}
              </Button>
            </div>
          </div>

          <div>
           <span className="text-gray-300">
           Recuerde que debe esperar un lapso de 24 a 36 Horas aproximadamente mientras nuestro equipo trabaja para verificar y validar su compra y proceder a enviarles sus números de manera aleatoria por WhatsApp a su numero telefonico suministrado previamente
           </span>
          </div>

          <Button
            type="submit"
            disabled={!selectedPayment || isSubmitting}
            className="w-full py-6 text-lg font-bold text-white  rounded-full  bg-[#023429] hover:bg-[#034a3d]"
          >
            {isSubmitting ? "Procesando..." : `Comprar ${quantity} ticket${quantity > 1 ? 's' : ''}`}
          </Button>
        </form>
      </div>
    </div>
  )
}
