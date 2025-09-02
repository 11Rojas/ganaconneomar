import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Buscar todas las compras con el email proporcionado
    const purchases = await Purchase.find({
      "paymentData.email": email
    })
    .populate("raffleId", "title description image drawDate status")
    .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente

    if (purchases.length === 0) {
      return NextResponse.json({
        tickets: [],
        message: "No se encontraron tickets para este email"
      })
    }

    // Formatear los datos para el frontend
    const tickets = purchases.map(purchase => ({
      _id: purchase._id,
      raffleId: purchase.raffleId,
      numbers: purchase.numbers,
      totalAmount: purchase.totalAmount,
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      createdAt: purchase.createdAt,
      paymentData: purchase.paymentData
    }))

    return NextResponse.json({
      tickets,
      count: tickets.length
    })

  } catch (error) {
    console.error("Error verificando tickets:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
