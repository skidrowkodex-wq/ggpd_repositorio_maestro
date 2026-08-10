import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecursoHumanoForm } from "@/components/recurso-humano-form"

async function getPartidas() {
  return prisma.partida_presupuestaria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevoRecursoHumanoPage() {
  const partidas = await getPartidas()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Recurso Humano</h2>
        <p className="text-muted-foreground">Crear un nuevo recurso humano (Partida 402)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Recurso Humano</CardTitle>
        </CardHeader>
        <CardContent>
          <RecursoHumanoForm partidas={partidas} />
        </CardContent>
      </Card>
    </div>
  )
}
