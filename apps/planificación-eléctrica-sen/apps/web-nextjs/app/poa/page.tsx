import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

async function getPOAs() {
  return prisma.poa.findMany({
    where: { activo: true },
    include: {
      unidad: true,
      _count: {
        select: {
          accion_especifica: true,
        },
      },
    },
    orderBy: { anio: "desc" },
  })
}

export default async function POAPage() {
  const poas = await getPOAs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planes Operativos Anuales</h2>
          <p className="text-muted-foreground">
            Gestión y seguimiento de POA del Sector Eléctrico
          </p>
        </div>
        <Link
          href="/poa/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nuevo POA
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de POA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Año
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Unidad
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Acciones
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Fecha Inicio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {poas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay POA registrados
                    </td>
                  </tr>
                ) : (
                  poas.map((poa) => (
                    <tr key={poa.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{poa.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{poa.nombre}</td>
                      <td className="px-4 py-3 text-sm">{poa.anio}</td>
                      <td className="px-4 py-3 text-sm">{poa.unidad.nombre}</td>
                      <td className="px-4 py-3 text-sm">{poa._count.accion_especifica}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            poa.estado === "aprobado"
                              ? "bg-green-100 text-green-700"
                              : poa.estado === "en_revision"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {poa.estado ?? "borrador"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(poa.fecha_inicio)}</td>
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
