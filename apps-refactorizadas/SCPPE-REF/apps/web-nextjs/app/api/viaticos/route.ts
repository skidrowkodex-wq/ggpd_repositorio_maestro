import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partidaId = searchParams.get("partida_id")

    const where = partidaId ? { partida_presupuestaria_id: partidaId } : {}

    const viaticos = await prisma.viatico.findMany({
      where,
      include: {
        partida_presupuestaria: true,
        _count: { select: { asignacion_viatico: true } },
      },
      orderBy: { concepto: "asc" },
    })
    return NextResponse.json(viaticos)
  } catch {
    return NextResponse.json({ error: "Error al obtener viáticos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const viatico = await prisma.viatico.create({
      data: {
        partida_presupuestaria_id: body.partida_presupuestaria_id,
        concepto: body.concepto,
        numero_personas: body.numero_personas,
        dias: body.dias,
        costo_unitario: body.costo_unitario ? parseFloat(body.costo_unitario) : 0,
      },
    })
    return NextResponse.json(viatico, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear viático" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const viatico = await prisma.viatico.update({
      where: { id },
      data,
    })
    return NextResponse.json(viatico)
  } catch {
    return NextResponse.json({ error: "Error al actualizar viático" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.viatico.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar viático" }, { status: 500 })
  }
}
