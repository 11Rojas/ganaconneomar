import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle  from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary";



export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}
    if (status) query.status = status

    const raffles = await Raffle.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Raffle.countDocuments(query)

    return NextResponse.json({
      raffles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json({ error: "Error al obtener las rifas" }, { status: 500 })
  }
}




export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const ticketPrice = parseFloat(formData.get("ticketPrice") as string);
    const totalNumbers = parseInt(formData.get("totalNumbers") as string);
    const drawDate = formData.get("drawDate") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";

    // Subir imagen a Cloudinary si existe
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "rifas", resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
              return;
            }
            resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = result.secure_url;
    }

    const newRaffle = new Raffle({
      title,
      description,
      ticketPrice,
      totalNumbers,
      drawDate: new Date(drawDate),
      status: "active",
      image: imageUrl,
    });

    await newRaffle.save();



    

    return NextResponse.json(newRaffle, { status: 201 });
  } catch (error) {
    console.error("Error creating raffle:", error);
    return NextResponse.json(
      { error: "Error al crear la rifa" },
      { status: 500 }
    );
  }
}