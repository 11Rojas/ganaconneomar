import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import  Raffle  from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const raffle = await Raffle.findById(id)
    if (!raffle) {
      return NextResponse.json({ error: "Rifa no encontrada" }, { status: 404 })
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Error fetching raffle:", error)
    return NextResponse.json({ error: "Error al obtener la rifa" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()
    const { id } = await params

    // Obtener FormData de la solicitud
    const formData = await request.formData()

    // Extraer datos del formulario
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const ticketPrice = Number(formData.get('ticketPrice'))
    const totalNumbers = Number(formData.get('totalNumbers'))
    const drawDate = formData.get('drawDate') as string
    const currentImage = formData.get('currentImage') as string
    const imageFile = formData.get('image') as File | null

    // Validar datos requeridos
    if (!title || !description || isNaN(ticketPrice) || isNaN(totalNumbers) || !drawDate) {
      return NextResponse.json(
        { error: "Faltan campos requeridos o son inválidos" },
        { status: 400 }
      )
    }

    // Preparar objeto de actualización
    const updateData: any = {
      title,
      description,
      ticketPrice,
      totalNumbers,
      drawDate: new Date(drawDate),
      currentImage
    }

    // Subir imagen a Cloudinary si existe
    if (imageFile && imageFile.size > 0) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "rifas", resource_type: "auto" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error)
                reject(error)
                return
              }
              resolve(result)
            }
          ).end(buffer)
        })

        updateData.image = result.secure_url
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        return NextResponse.json(
          { error: "Error al subir la imagen" },
          { status: 500 }
        )
      }
    }

    // Actualizar la rifa en la base de datos
    const raffle = await Raffle.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Error updating raffle:", error)
    return NextResponse.json(
      { error: "Error al actualizar la rifa" },
      { status: 500 }
    )
  }
}

// Función auxiliar para subir imágenes a Cloudinary
async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'tu_upload_preset'); // Reemplaza con tu upload preset

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload`, // Reemplaza con tu cloud name
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Error al subir la imagen');
  }

  return response.json();
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { id } = await params
    const raffle = await Raffle.findByIdAndDelete(id)
    if (!raffle) {
      return NextResponse.json({ error: "Rifa no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Rifa eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting raffle:", error)
    return NextResponse.json({ error: "Error al eliminar la rifa" }, { status: 500 })
  }
}
