import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

async function getItems() {
  return prisma.item_presupuestario.findMany({
    where: { activo: true },
    include: {
      partida_presupuestaria: true,
      partida_elemento: true,
      _count: { select: { ejecucion_item: true } },
    },
    orderBy: { codigo: "asc" },
  })
}

export default async function ItemsPage() {
  const items = await getItems()

  const totalCosto = items.reduce(
    (sum, i) => sum + (i.costo_unitario.toNumber() ?? 0) * (i.cantidad.toNumber() ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Items Presupuestarios</h2>
          <p className="text-muted-foreground">
            Gestión de items y su ejecución presupuestaria
          </p>
        </div>
        <Link
          href="/items/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nuevo Item
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Items</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalCosto)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Partida</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Unit.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ejecuciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No hay items registrados
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{item.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">{item.nombre}</td>
                      <td className="px-4 py-3 text-sm">{item.partida_presupuestaria.nombre}</td>
                      <td className="px-4 py-3 text-sm">{item.tipo_item}</td>
                      <td className="px-4 py-3 text-sm">{item.cantidad.toNumber()} {item.unidad_medida ?? ""}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(item.costo_unitario.toNumber())}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatCurrency(item.costo_unitario.toNumber() * item.cantidad.toNumber())}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            item.estado === "COMPLETADO"
                              ? "bg-green-100 text-green-700"
                              : item.estado === "EN_PROCESO"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item._count.ejecucion_item}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
