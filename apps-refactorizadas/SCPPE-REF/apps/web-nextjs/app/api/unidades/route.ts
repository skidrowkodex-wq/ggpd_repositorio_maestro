import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gerenciaId = searchParams.get("gerencia_id")

    const where = gerenciaId ? { gerencia_id: gerenciaId, activo: true } : { activo: true }

    const unidades = await prisma.unidad.findMany({
      where,
      include: {
        gerencia: true,
        _count: { select: { poa: true } },
      },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(unidades)
  } catch {
    return NextResponse.json({ error: "Error al obtener unidades" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const unidad = await prisma.unidad.create({
      data: {
        gerencia_id: body.gerencia_id,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
      },
    })
    return NextResponse.json(unidad, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear unidad" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const unidad = await prisma.unidad.update({
      where: { id },
      data,
    })
    return NextResponse.json(unidad)
  } catch {
    return NextResponse.json({ error: "Error al actualizar unidad" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.unidad.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar unidad" }, { status: 500 })
  }
}
