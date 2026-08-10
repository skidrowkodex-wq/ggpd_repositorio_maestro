import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercentage } from "@/lib/utils"
import Link from "next/link"

async function getMetas() {
  return prisma.meta_fisica.findMany({
    where: { activo: true },
    include: {
      accion_especifica: true,
      mes: true,
    },
    orderBy: [
      { anio: "desc" },
      { mes: { numero: "asc" } },
    ],
  })
}

export default async function MetasPage() {
  const metas = await getMetas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metas Físicas</h2>
          <p className="text-muted-foreground">
            Seguimiento de metas físicas mensuales
          </p>
        </div>
        <Link
          href="/metas/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Meta
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Metas Físicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Año</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Programado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ejecutado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Eficacia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay metas físicas registradas
                    </td>
                  </tr>
                ) : (
                  metas.map((meta) => (
                    <tr key={meta.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{meta.accion_especifica.nombre}</td>
                      <td className="px-4 py-3 text-sm">{meta.anio}</td>
                      <td className="px-4 py-3 text-sm">{meta.mes.nombre_corto}</td>
                      <td className="px-4 py-3 text-sm">{meta.programado.toNumber()}</td>
                      <td className="px-4 py-3 text-sm">{meta.ejecutado.toNumber()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            meta.eficacia?.toNumber() ?? 0 >= 80
                              ? "bg-green-100 text-green-700"
                              : meta.eficacia?.toNumber() ?? 0 >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {formatPercentage(meta.eficacia?.toNumber() ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{meta.unidad_medida ?? meta.accion_especifica.unidad_medida ?? "—"}</td>
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
