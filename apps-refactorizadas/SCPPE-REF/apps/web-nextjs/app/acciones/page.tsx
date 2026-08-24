import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatPercentage } from "@/lib/utils"
import Link from "next/link"

async function getAcciones() {
  return prisma.accion_especifica.findMany({
    where: { activo: true },
    include: {
      poa: {
        include: {
          unidad: true,
        },
      },
      _count: {
        select: {
          partida_presupuestaria: true,
          meta_fisica: true,
        },
      },
    },
    orderBy: [{ poa: { anio: "desc" } }, { orden: "asc" }],
  })
}

export default async function AccionesPage() {
  const acciones = await getAcciones()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Acciones Específicas</h2>
          <p className="text-muted-foreground">
            Gestión de acciones específicas del POA
          </p>
        </div>
        <Link
          href="/acciones/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Acción
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Acciones Específicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">POA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Unidad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Meta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Partidas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Metas Físicas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ponderación</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Período</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {acciones.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No hay acciones específicas registradas
                    </td>
                  </tr>
                ) : (
                  acciones.map((accion) => (
                    <tr key={accion.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{accion.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{accion.nombre}</td>
                      <td className="px-4 py-3 text-sm">{accion.poa.nombre} ({accion.poa.anio})</td>
                      <td className="px-4 py-3 text-sm">{accion.poa.unidad.nombre}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{accion.meta ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">{accion._count.partida_presupuestaria}</td>
                      <td className="px-4 py-3 text-sm">{accion._count.meta_fisica}</td>
                      <td className="px-4 py-3 text-sm">{accion.ponderacion ? formatPercentage(accion.ponderacion.toNumber()) : "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(accion.fecha_inicio_accion)} → {formatDate(accion.fecha_fin_accion)}
                      </td>
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
