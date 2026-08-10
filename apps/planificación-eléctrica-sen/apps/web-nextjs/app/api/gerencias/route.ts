import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enteId = searchParams.get("ente_id")

    const where = enteId ? { ente_id: enteId, activo: true } : { activo: true }

    const gerencias = await prisma.gerencia.findMany({
      where,
      include: {
        ente: true,
        estado: true,
        region_geografica: true,
        _count: { select: { unidad: true } },
      },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(gerencias)
  } catch {
    return NextResponse.json({ error: "Error al obtener gerencias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const gerencia = await prisma.gerencia.create({
      data: {
        ente_id: body.ente_id,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        ambito: body.ambito ?? "GENERAL",
        proceso_medular: body.proceso_medular ?? "NO APLICA",
        ceco: body.ceco,
        codigo_sap: body.codigo_sap,
        municipio_id: body.municipio_id,
        region_id: body.region_id,
        estado_id: body.estado_id,
        direccion_fisica: body.direccion_fisica,
        centro_servicios: body.centro_servicios,
      },
    })
    return NextResponse.json(gerencia, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear gerencia" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const gerencia = await prisma.gerencia.update({
      where: { id },
      data,
    })
    return NextResponse.json(gerencia)
  } catch {
    return NextResponse.json({ error: "Error al actualizar gerencia" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.gerencia.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar gerencia" }, { status: 500 })
  }
}
