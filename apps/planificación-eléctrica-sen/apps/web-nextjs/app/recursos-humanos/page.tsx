import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

async function getRecursosHumanos() {
  return prisma.recurso_humano.findMany({
    include: {
      partida_presupuestaria: {
        include: {
          accion_especifica: true,
        },
      },
    },
    orderBy: { rol_funcional: "asc" },
  })
}

export default async function RecursosHumanosPage() {
  const recursos = await getRecursosHumanos()

  const totalCostoAnual = recursos.reduce(
    (sum, r) => sum + (r.costo_anual?.toNumber() ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recursos Humanos</h2>
          <p className="text-muted-foreground">
            Gestión de recursos humanos (Partida 402)
          </p>
        </div>
        <Link
          href="/recursos-humanos/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nuevo Recurso
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Recursos Humanos</CardTitle>
          <div className="text-sm text-muted-foreground">
            Costo Anual Total: <span className="font-semibold text-foreground">{formatCurrency(totalCostoAnual)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rol Funcional</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Partida</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dedicación (meses)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Mensual</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Costo Anual</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recursos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No hay recursos humanos registrados
                    </td>
                  </tr>
                ) : (
                  recursos.map((recurso) => (
                    <tr key={recurso.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{recurso.rol_funcional}</td>
                      <td className="px-4 py-3 text-sm">{recurso.partida_presupuestaria.nombre}</td>
                      <td className="px-4 py-3 text-sm">{recurso.partida_presupuestaria.accion_especifica.nombre}</td>
                      <td className="px-4 py-3 text-sm">{recurso.dedicacion_meses}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(recurso.costo_mensual.toNumber())}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(recurso.costo_anual?.toNumber() ?? 0)}</td>
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
