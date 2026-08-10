import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function getUnidades() {
  return prisma.unidad.findMany({
    where: { activo: true },
    include: {
      gerencia: true,
      _count: { select: { poa: true } },
    },
    orderBy: { nombre: "asc" },
  })
}

export default async function UnidadesPage() {
  const unidades = await getUnidades()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unidades</h2>
          <p className="text-muted-foreground">
            Gestión de unidades ejecutoras
          </p>
        </div>
        <Link
          href="/unidades/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Unidad
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Unidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gerencia</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">POA Asociados</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {unidades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No hay unidades registradas
                    </td>
                  </tr>
                ) : (
                  unidades.map((unidad) => (
                    <tr key={unidad.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{unidad.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{unidad.nombre}</td>
                      <td className="px-4 py-3 text-sm">
                        {unidad.gerencia.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm">{unidad._count.poa}</td>
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
