import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const poas = await prisma.poa.findMany({
      where: { activo: true },
      include: {
        unidad: true,
        _count: {
          select: {
            accion_especifica: true,
          },
        },
      },
      orderBy: { anio: "desc" },
    })
    return NextResponse.json(poas)
  } catch {
    return NextResponse.json({ error: "Error al obtener POA" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const poa = await prisma.poa.create({
      data: {
        unidad_id: body.unidad_id,
        anio: body.anio,
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        fecha_inicio: body.fecha_inicio ? new Date(body.fecha_inicio) : null,
        fecha_fin: body.fecha_fin ? new Date(body.fecha_fin) : null,
        politica_sen: body.politica_sen,
        programa_sen: body.programa_sen,
        codigo_sipes: body.codigo_sipes,
        organismo_responsable: body.organismo_responsable,
        unidad_ejecutora_local: body.unidad_ejecutora_local,
        objetivo_especifico_unidad: body.objetivo_especifico_unidad,
        responsable_ejecucion_nombre: body.responsable_ejecucion_nombre,
        cargo_responsable: body.cargo_responsable,
        es_plurianual: body.es_plurianual ?? false,
        situacion_presupuestaria: body.situacion_presupuestaria ?? "POR INICIAR",
        responsable_tecnico_nombre: body.responsable_tecnico_nombre,
        responsable_tecnico_email: body.responsable_tecnico_email,
        responsable_admin_nombre: body.responsable_admin_nombre,
        responsable_admin_email: body.responsable_admin_email,
        localizacion: body.localizacion,
      },
    })
    return NextResponse.json(poa, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear POA" }, { status: 500 })
  }
}
