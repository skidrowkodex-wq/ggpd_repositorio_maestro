import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get("empresa_id")

    const where = empresaId ? { empresa_id: empresaId, activo: true } : { activo: true }

    const entes = await prisma.ente.findMany({
      where,
      include: {
        empresa: true,
        _count: { select: { gerencia: true } },
      },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(entes)
  } catch {
    return NextResponse.json({ error: "Error al obtener entes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ente = await prisma.ente.create({
      data: {
        empresa_id: body.empresa_id,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        tipo: body.tipo ?? "OTROS",
      },
    })
    return NextResponse.json(ente, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear ente" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const ente = await prisma.ente.update({
      where: { id },
      data,
    })
    return NextResponse.json(ente)
  } catch {
    return NextResponse.json({ error: "Error al actualizar ente" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.ente.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar ente" }, { status: 500 })
  }
}
