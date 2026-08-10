import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

async function getViaticos() {
  return prisma.viatico.findMany({
    include: {
      partida_presupuestaria: true,
      _count: { select: { asignacion_viatico: true } },
    },
    orderBy: { concepto: "asc" },
  })
}

export default async function ViaticosPage() {
  const viaticos = await getViaticos()

  const totalCosto = viaticos.reduce(
    (sum, v) => sum + (v.costo_total?.toNumber() ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Viáticos</h2>
          <p className="text-muted-foreground">
            Gestión de viáticos (Partida 405)
          </p>
        </div>
        <Link
          href="/viaticos/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nuevo Viático
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Viáticos</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalCosto)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Concepto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Partida</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Personas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Días</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Unit.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asignaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {viaticos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay viáticos registrados
                    </td>
                  </tr>
                ) : (
                  viaticos.map((viatico) => (
                    <tr key={viatico.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{viatico.concepto}</td>
                      <td className="px-4 py-3 text-sm">{viatico.partida_presupuestaria.nombre}</td>
                      <td className="px-4 py-3 text-sm">{viatico.numero_personas}</td>
                      <td className="px-4 py-3 text-sm">{viatico.dias}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(viatico.costo_unitario.toNumber())}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(viatico.costo_total?.toNumber() ?? 0)}</td>
                      <td className="px-4 py-3 text-sm">{viatico._count.asignacion_viatico}</td>
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
