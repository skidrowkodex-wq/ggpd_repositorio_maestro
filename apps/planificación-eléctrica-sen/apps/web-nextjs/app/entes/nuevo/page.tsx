import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnteForm } from "@/components/ente-form"

async function getEmpresas() {
  return prisma.empresa.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevoEntePage() {
  const empresas = await getEmpresas()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Ente</h2>
        <p className="text-muted-foreground">Crear un nuevo ente adscrito a una empresa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Ente</CardTitle>
        </CardHeader>
        <CardContent>
          <EnteForm empresas={empresas} />
        </CardContent>
      </Card>
    </div>
  )
}
