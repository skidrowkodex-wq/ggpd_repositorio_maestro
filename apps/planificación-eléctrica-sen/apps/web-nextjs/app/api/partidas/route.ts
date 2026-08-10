import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accionId = searchParams.get("accion_id")

    const where = accionId ? { accion_especifica_id: accionId, activo: true } : { activo: true }

    const partidas = await prisma.partida_presupuestaria.findMany({
      where,
      include: {
        accion_especifica: true,
        _count: {
          select: {
            item_presupuestario: true,
            recurso_humano: true,
            viatico: true,
          },
        },
      },
      orderBy: { codigo: "asc" },
    })
    return NextResponse.json(partidas)
  } catch {
    return NextResponse.json({ error: "Error al obtener partidas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const partida = await prisma.partida_presupuestaria.create({
      data: {
        accion_especifica_id: body.accion_especifica_id,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        monto_presupuestado: body.monto_presupuestado ? parseFloat(body.monto_presupuestado) : null,
        monto_ejecutado: body.monto_ejecutado ? parseFloat(body.monto_ejecutado) : null,
        moneda: body.moneda ?? "VES",
        cantidad: body.cantidad ? parseFloat(body.cantidad) : null,
        unidad_medida: body.unidad_medida,
        costo_unitario: body.costo_unitario ? parseFloat(body.costo_unitario) : null,
        justificacion: body.justificacion,
      },
    })
    return NextResponse.json(partida, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear partida" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const partida = await prisma.partida_presupuestaria.update({
      where: { id },
      data,
    })
    return NextResponse.json(partida)
  } catch {
    return NextResponse.json({ error: "Error al actualizar partida" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.partida_presupuestaria.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar partida" }, { status: 500 })
  }
}
