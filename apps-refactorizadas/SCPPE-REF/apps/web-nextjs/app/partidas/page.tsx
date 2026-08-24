import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

async function getPartidas() {
  return prisma.partida_presupuestaria.findMany({
    where: { activo: true },
    include: {
      accion_especifica: true,
      _count: {
        select: {
          item_presupuestario: true,
          recurso_humano: true,
          viatico: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  })
}

export default async function PartidasPage() {
  const partidas = await getPartidas()

  const totalPresupuestado = partidas.reduce(
    (sum, p) => sum + (p.monto_presupuestado?.toNumber() ?? 0),
    0
  )
  const totalEjecutado = partidas.reduce(
    (sum, p) => sum + (p.monto_ejecutado?.toNumber() ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partidas Presupuestarias</h2>
          <p className="text-muted-foreground">
            Gestión de partidas presupuestarias del POA
          </p>
        </div>
        <Link
          href="/partidas/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Partida
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPresupuestado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ejecutado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEjecutado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPresupuestado - totalEjecutado)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acción</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Presupuestado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ejecutado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">RRHH</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Viáticos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partidas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No hay partidas registradas
                    </td>
                  </tr>
                ) : (
                  partidas.map((partida) => (
                    <tr key={partida.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{partida.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">{partida.nombre}</td>
                      <td className="px-4 py-3 text-sm">{partida.accion_especifica.nombre}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(partida.monto_presupuestado?.toNumber() ?? 0)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(partida.monto_ejecutado?.toNumber() ?? 0)}</td>
                      <td className="px-4 py-3 text-sm">{partida._count.item_presupuestario}</td>
                      <td className="px-4 py-3 text-sm">{partida._count.recurso_humano}</td>
                      <td className="px-4 py-3 text-sm">{partida._count.viatico}</td>
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
