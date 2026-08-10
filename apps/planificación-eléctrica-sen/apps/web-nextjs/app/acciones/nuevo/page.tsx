import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AccionForm } from "@/components/accion-form"

async function getPOAs() {
  return prisma.poa.findMany({
    where: { activo: true },
    include: { unidad: true },
    orderBy: [{ anio: "desc" }, { nombre: "asc" }],
  })
}

export default async function NuevaAccionPage() {
  const poas = await getPOAs()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Acción Específica</h2>
        <p className="text-muted-foreground">Crear una nueva acción específica para un POA</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Acción</CardTitle>
        </CardHeader>
        <CardContent>
          <AccionForm poas={poas} />
        </CardContent>
      </Card>
    </div>
  )
}
