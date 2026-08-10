import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      where: { activo: true },
      include: { _count: { select: { ente: true } } },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(empresas)
  } catch {
    return NextResponse.json({ error: "Error al obtener empresas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const empresa = await prisma.empresa.create({
      data: {
        codigo: body.codigo,
        nombre: body.nombre,
        rif: body.rif,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        tipo: body.tipo ?? "PÚBLICA",
        ambito: body.ambito ?? "NACIONALES",
      },
    })
    return NextResponse.json(empresa, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear empresa" }, { status: 500 })
  }
}
