import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemForm } from "@/components/item-form"

async function getPartidas() {
  return prisma.partida_presupuestaria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

async function getElementos() {
  return prisma.partida_elemento.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  })
}

export default async function NuevoItemPage() {
  const [partidas, elementos] = await Promise.all([getPartidas(), getElementos()])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Item Presupuestario</h2>
        <p className="text-muted-foreground">Crear un nuevo item presupuestario</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Item</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm partidas={partidas} elementos={elementos} />
        </CardContent>
      </Card>
    </div>
  )
}
