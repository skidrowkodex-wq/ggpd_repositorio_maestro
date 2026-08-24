import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function getGerencias() {
  return prisma.gerencia.findMany({
    where: { activo: true },
    include: {
      ente: true,
      estado: true,
      region_geografica: true,
      _count: { select: { unidad: true } },
    },
    orderBy: { nombre: "asc" },
  })
}

export default async function GerenciasPage() {
  const gerencias = await getGerencias()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerencias</h2>
          <p className="text-muted-foreground">
            Gestión de gerencias de la organización
          </p>
        </div>
        <Link
          href="/gerencias/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Gerencia
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gerencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ámbito</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Proceso Medular</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Región</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Unidades</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gerencias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay gerencias registradas
                    </td>
                  </tr>
                ) : (
                  gerencias.map((gerencia) => (
                    <tr key={gerencia.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{gerencia.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{gerencia.nombre}</td>
                      <td className="px-4 py-3 text-sm">
                        {gerencia.ente.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm">{gerencia.ambito}</td>
                      <td className="px-4 py-3 text-sm">{gerencia.proceso_medular}</td>
                      <td className="px-4 py-3 text-sm">
                        {gerencia.region_geografica?.nombre ?? "—"}
                        {gerencia.estado ? `, ${gerencia.estado.nombre}` : ""}
                      </td>
                      <td className="px-4 py-3 text-sm">{gerencia._count.unidad}</td>
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
