import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ViaticoForm } from "@/components/viatico-form"

async function getPartidas() {
  return prisma.partida_presupuestaria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevoViaticoPage() {
  const partidas = await getPartidas()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Viático</h2>
        <p className="text-muted-foreground">Crear un nuevo viático (Partida 405)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Viático</CardTitle>
        </CardHeader>
        <CardContent>
          <ViaticoForm partidas={partidas} />
        </CardContent>
      </Card>
    </div>
  )
}
