import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartidaForm } from "@/components/partida-form"

async function getAcciones() {
  return prisma.accion_especifica.findMany({
    where: { activo: true },
    include: { poa: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevaPartidaPage() {
  const acciones = await getAcciones()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Partida Presupuestaria</h2>
        <p className="text-muted-foreground">Crear una nueva partida presupuestaria</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Partida</CardTitle>
        </CardHeader>
        <CardContent>
          <PartidaForm acciones={acciones} />
        </CardContent>
      </Card>
    </div>
  )
}
