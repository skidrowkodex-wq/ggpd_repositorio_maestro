import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function getEmpresas() {
  return prisma.empresa.findMany({
    where: { activo: true },
    include: { _count: { select: { ente: true } } },
    orderBy: { nombre: "asc" },
  })
}

export default async function EmpresasPage() {
  const empresas = await getEmpresas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
          <p className="text-muted-foreground">
            Gestión de empresas del sector eléctrico
          </p>
        </div>
        <Link
          href="/empresas/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nueva Empresa
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
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
                    RIF
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Ámbito
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Entes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {empresas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No hay empresas registradas
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{empresa.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{empresa.nombre}</td>
                      <td className="px-4 py-3 text-sm">{empresa.rif ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">{empresa.tipo}</td>
                      <td className="px-4 py-3 text-sm">{empresa.ambito}</td>
                      <td className="px-4 py-3 text-sm">{empresa._count.ente}</td>
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
