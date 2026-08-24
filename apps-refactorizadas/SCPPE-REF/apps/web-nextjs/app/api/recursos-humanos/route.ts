import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const partidaId = searchParams.get("partida_id")

    const where = partidaId ? { partida_presupuestaria_id: partidaId } : {}

    const recursos = await prisma.recurso_humano.findMany({
      where,
      include: {
        partida_presupuestaria: true,
      },
      orderBy: { rol_funcional: "asc" },
    })
    return NextResponse.json(recursos)
  } catch {
    return NextResponse.json({ error: "Error al obtener recursos humanos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const recurso = await prisma.recurso_humano.create({
      data: {
        partida_presupuestaria_id: body.partida_presupuestaria_id,
        rol_funcional: body.rol_funcional,
        dedicacion_meses: body.dedicacion_meses,
        costo_mensual: body.costo_mensual ? parseFloat(body.costo_mensual) : 0,
      },
    })
    return NextResponse.json(recurso, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear recurso humano" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const recurso = await prisma.recurso_humano.update({
      where: { id },
      data,
    })
    return NextResponse.json(recurso)
  } catch {
    return NextResponse.json({ error: "Error al actualizar recurso humano" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    await prisma.recurso_humano.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar recurso humano" }, { status: 500 })
  }
}
