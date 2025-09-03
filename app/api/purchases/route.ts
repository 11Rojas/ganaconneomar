import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"
import { requireAuth } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'
import { sendPurchaseNotification } from "@/lib/mailer"

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const raffleId = formData.get("raffleId")?.toString()
    const quantity = parseInt(formData.get("quantity")?.toString() || "0")
    const paymentMethod = formData.get("paymentMethod")?.toString()
    const paymentData = JSON.parse(formData.get("paymentData")?.toString() || "{}")
    const receiptFile = formData.get("receipt") as File | null

    // Validaciones básicas
    if (!raffleId || !quantity || !paymentMethod || !receiptFile) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Validar paymentMethod
    const validPaymentMethods = ["zelle", "pago-movil", "pago-movil2", "mercado-pago"]
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Método de pago no válido" },
        { status: 400 }
      )
    }

    // Validar paymentData según el método
    if ((paymentMethod === "pago-movil" || paymentMethod === "pago-movil2" || paymentMethod === "zelle") && !paymentData.reference) {
      return NextResponse.json(
        { error: "La referencia es requerida para este método de pago" },
        { status: 400 }
      )
    }

    // Verificar que la rifa existe y está activa
    const raffle = await (Raffle as any).findById(raffleId)
    if (!raffle || raffle.status !== "active") {
      return NextResponse.json(
        { error: "Rifa no disponible" },
        { status: 400 }
      )
    }

    // Validar ticketPrice
    const ticketPrice = parseFloat(raffle.ticketPrice?.toString() || "0")
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      return NextResponse.json(
        { error: "Precio del ticket no válido" },
        { status: 400 }
      )
    }

    // Verificar disponibilidad de números
    const totalNumbers = raffle.totalNumbers || 0
    const soldNumbers = raffle.soldNumbers || []
    const availableNumbersCount = totalNumbers - soldNumbers.length
    
    if (availableNumbersCount < quantity) {
      return NextResponse.json(
        { error: `No hay suficientes números disponibles. Solo quedan ${availableNumbersCount} números` }, 
        { status: 400 }
      )
    }

    // Generar todos los números posibles con formato 0001
    const allNumbers = Array.from({ length: totalNumbers }, (_, i) => 
      (i + 1).toString().padStart(4, '0')
    )
    
    // Filtrar números disponibles
    const availableNumbers = allNumbers.filter(num => !soldNumbers.includes(num))
    
    // Asignar números aleatorios
    const assignedNumbers = [...availableNumbers]
      .sort(() => 0.5 - Math.random())
      .slice(0, quantity)
      .sort((a, b) => parseInt(a) - parseInt(b)) // Ordenar numéricamente

    // Subir comprobante a Cloudinary
    let receiptUrl = ""
    if (receiptFile) {
      const arrayBuffer = await receiptFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: "receipts",
            resource_type: "auto",
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      receiptUrl = (result as any)?.secure_url || ""
    }

    // Calcular monto total
    const totalAmount = quantity * ticketPrice

    // Crear la compra
    const purchase = new Purchase({
      raffleId,
      numbers: assignedNumbers,
      totalAmount,
      paymentMethod,
      paymentData: {
        ...paymentData,
        receipt: receiptUrl,
      },
      status: "pending",
    })

    await purchase.save()

    // Actualizar números vendidos
    await (Raffle as any).findByIdAndUpdate(raffleId, {
      $addToSet: { soldNumbers: { $each: assignedNumbers } },
    })

    // Enviar notificación por email
    try {
      await sendPurchaseNotification({
        email: paymentData.email || '',
        name: paymentData.name || 'Usuario',
        raffleTitle: raffle.title,
        numbers: assignedNumbers.map(Number),
        totalAmount,
        paymentMethod,
        reference: paymentData.reference || ''
      })
    } catch (emailError) {
      console.error('Error sending email notification:', emailError)
      // No fallar la compra si el email falla
    }

    return NextResponse.json({
      ...purchase.toObject(),
      message: `Números asignados: ${assignedNumbers.join(", ")}`
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json(
      { error: "Error al procesar la compra", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const query: any = {}

    if (session.user.role !== "admin") {
      query.userId = session.user.id
    }

    if (status) query.status = status

    const purchases = await (Purchase as any).find(query)
      .populate("raffleId", "title image drawDate")
      .sort({ createdAt: -1 })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ error: "Error al obtener las compras" }, { status: 500 })
  }
}