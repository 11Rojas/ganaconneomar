import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // 1. Encontrar la última rifa activa
    const lastActiveRaffle = await Raffle.findOne(
      { status: "active" },
      {},
      { sort: { createdAt: -1 } }
    )

    if (!lastActiveRaffle) {
      return NextResponse.json(
        { topBuyers: [] },
        { status: 200 }
      )
    }

    // 2. Agregación optimizada para obtener solo nombre y cantidad de números
    const topBuyers = await Purchase.aggregate([
      { 
        $match: { 
          status: "approved",
          raffleId: lastActiveRaffle._id,
          "paymentData.name": { $exists: true, $ne: "" } // Solo nombres no vacíos
        } 
      },
      {
        $group: {
          _id: "$paymentData.name", // Agrupamos directamente por nombre
          totalNumbers: { $sum: { $size: "$numbers" } } // Sumamos los números
        }
      },
      { $sort: { totalNumbers: -1 } }, // Ordenamos por cantidad de números
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalNumbers: 1
        }
      }
    ])

    return NextResponse.json({
      topBuyers
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { topBuyers: [], error: "Error al obtener datos" },
      { status: 500 }
    )
  }
}