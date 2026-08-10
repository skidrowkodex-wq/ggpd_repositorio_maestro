import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GerenciaForm } from "@/components/gerencia-form"

async function getEntes() {
  return prisma.ente.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

async function getRegiones() {
  return prisma.region_geografica.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

async function getEstados() {
  return prisma.estado.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevaGerenciaPage() {
  const [entes, regiones, estados] = await Promise.all([
    getEntes(),
    getRegiones(),
    getEstados(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Gerencia</h2>
        <p className="text-muted-foreground">Crear una nueva gerencia en la organización</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Gerencia</CardTitle>
        </CardHeader>
        <CardContent>
          <GerenciaForm entes={entes} regiones={regiones} estados={estados} />
        </CardContent>
      </Card>
    </div>
  )
}
