import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partidaId = searchParams.get("partida_id")

    const where = partidaId ? { partida_presupuestaria_id: partidaId, activo: true } : { activo: true }

    const items = await prisma.item_presupuestario.findMany({
      where,
      include: {
        partida_presupuestaria: true,
        partida_elemento: true,
        _count: { select: { ejecucion_item: true } },
      },
      orderBy: { codigo: "asc" },
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: "Error al obtener items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await prisma.item_presupuestario.create({
      data: {
        partida_presupuestaria_id: body.partida_presupuestaria_id,
        elemento_id: body.elemento_id,
        codigo: body.codigo,
        codigo_snc: body.codigo_snc,
        codigo_sap: body.codigo_sap,
        nombre: body.nombre,
        descripcion: body.descripcion,
        especificacion_tecnica: body.especificacion_tecnica,
        cantidad: body.cantidad ? parseFloat(body.cantidad) : 0,
        unidad_medida: body.unidad_medida,
        costo_unitario: body.costo_unitario ? parseFloat(body.costo_unitario) : 0,
        tipo_item: body.tipo_item,
        tipo_reemplazo: body.tipo_reemplazo,
        categoria_codigo: body.categoria_codigo,
        subcategoria_codigo: body.subcategoria_codigo,
        tipo_servicio: body.tipo_servicio,
        periodo_facturacion: body.periodo_facturacion,
        proveedor: body.proveedor,
        marca: body.marca,
        modelo: body.modelo,
        vida_util_meses: body.vida_util_meses,
        estado_activo: body.estado_activo,
        numero_personas: body.numero_personas,
        numero_dias: body.numero_dias,
        unidades_tributarias: body.unidades_tributarias,
        costo_por_ut: body.costo_por_ut,
        destino: body.destino,
        tipo_viatico: body.tipo_viatico,
        justificacion: body.justificacion,
        estado: body.estado ?? "PENDIENTE",
        fecha_ejecucion_estimada: body.fecha_ejecucion_estimada ? new Date(body.fecha_ejecucion_estimada) : null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear item" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const item = await prisma.item_presupuestario.update({
      where: { id },
      data,
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Error al actualizar item" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.item_presupuestario.update({
      where: { id },
      data: { activo: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar item" }, { status: 500 })
  }
}
