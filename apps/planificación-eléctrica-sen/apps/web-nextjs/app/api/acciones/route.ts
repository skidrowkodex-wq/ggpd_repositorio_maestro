import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const poaId = searchParams.get("poa_id")

    const where = poaId ? { poa_id: poaId, activo: true } : { activo: true }

    const acciones = await prisma.accion_especifica.findMany({
      where,
      include: {
        poa: true,
        _count: {
          select: {
            partida_presupuestaria: true,
            meta_fisica: true,
          },
        },
      },
      orderBy: [{ poa_id: "asc" }, { orden: "asc" }],
    })
    return NextResponse.json(acciones)
  } catch {
    return NextResponse.json({ error: "Error al obtener acciones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const accion = await prisma.accion_especifica.create({
      data: {
        poa_id: body.poa_id,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        meta: body.meta,
        indicador: body.indicador,
        unidad_medida: body.unidad_medida,
        orden: body.orden,
        ponderacion: body.ponderacion ? parseFloat(body.ponderacion) : null,
        fecha_inicio_accion: body.fecha_inicio_accion ? new Date(body.fecha_inicio_accion) : null,
        fecha_fin_accion: body.fecha_fin_accion ? new Date(body.fecha_fin_accion) : null,
        ejecutor: body.ejecutor,
      },
    })
    return NextResponse.json(accion, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear acción" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const accion = await prisma.accion_especifica.update({
      where: { id },
      data,
    })
    return NextResponse.json(accion)
  } catch {
    return NextResponse.json({ error: "Error al actualizar acción" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.accion_especifica.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar acción" }, { status: 500 })
  }
}
