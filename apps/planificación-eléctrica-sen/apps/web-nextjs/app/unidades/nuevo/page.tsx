import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UnidadForm } from "@/components/unidad-form"

async function getGerencias() {
  return prisma.gerencia.findMany({
    where: { activo: true },
    include: { ente: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevaUnidadPage() {
  const gerencias = await getGerencias()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Unidad</h2>
        <p className="text-muted-foreground">Crear una nueva unidad ejecutora</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Unidad</CardTitle>
        </CardHeader>
        <CardContent>
          <UnidadForm gerencias={gerencias} />
        </CardContent>
      </Card>
    </div>
  )
}
