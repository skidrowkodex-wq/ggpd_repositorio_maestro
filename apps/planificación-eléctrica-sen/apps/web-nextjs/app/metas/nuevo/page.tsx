import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetaForm } from "@/components/meta-form"

async function getAcciones() {
  return prisma.accion_especifica.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

async function getMeses() {
  return prisma.mes.findMany({
    orderBy: { numero: "asc" },
  })
}

export default async function NuevaMetaPage() {
  const [acciones, meses] = await Promise.all([getAcciones(), getMeses()])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Meta Física</h2>
        <p className="text-muted-foreground">Crear una nueva meta física mensual</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <MetaForm acciones={acciones} meses={meses} />
        </CardContent>
      </Card>
    </div>
  )
}
