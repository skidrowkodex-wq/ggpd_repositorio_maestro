import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accionId = searchParams.get("accion_id")
    const mesId = searchParams.get("mes_id")
    const anio = searchParams.get("anio")

    const where: Prisma.meta_fisicaWhereInput = { activo: true }
    if (accionId) where.accion_especifica_id = accionId
    if (mesId) where.mes_id = mesId
    if (anio) where.anio = parseInt(anio)

    const metas = await prisma.meta_fisica.findMany({
      where,
      include: {
        accion_especifica: true,
        mes: true,
      },
      orderBy: [{ anio: "desc" }, { mes: { numero: "asc" } }],
    })
    return NextResponse.json(metas)
  } catch {
    return NextResponse.json({ error: "Error al obtener metas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const meta = await prisma.meta_fisica.create({
      data: {
        accion_especifica_id: body.accion_especifica_id,
        mes_id: body.mes_id,
        anio: body.anio,
        programado: body.programado ? parseFloat(body.programado) : 0,
        ejecutado: body.ejecutado ? parseFloat(body.ejecutado) : 0,
        unidad_medida: body.unidad_medida,
      },
    })
    return NextResponse.json(meta, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear meta" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const meta = await prisma.meta_fisica.update({
      where: { id },
      data,
    })
    return NextResponse.json(meta)
  } catch {
    return NextResponse.json({ error: "Error al actualizar meta" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.meta_fisica.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar meta" }, { status: 500 })
  }
}
