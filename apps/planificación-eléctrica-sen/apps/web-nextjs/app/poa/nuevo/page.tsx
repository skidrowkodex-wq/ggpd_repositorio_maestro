import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { POAForm } from "@/components/poa-form"

async function getUnidades() {
  return prisma.unidad.findMany({
    where: { activo: true },
    include: {
      gerencia: {
        include: {
          ente: true,
        },
      },
    },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevoPOAPage() {
  const unidades = await getUnidades()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Plan Operativo Anual</h2>
        <p className="text-muted-foreground">
          Crear un nuevo POA para una unidad ejecutora
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del POA</CardTitle>
        </CardHeader>
        <CardContent>
          <POAForm unidades={unidades} />
        </CardContent>
      </Card>
    </div>
  )
}
