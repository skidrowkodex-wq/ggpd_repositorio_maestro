import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

async function getEntes() {
  return prisma.ente.findMany({
    where: { activo: true },
    include: {
      empresa: true,
      _count: { select: { gerencia: true } },
    },
    orderBy: { nombre: "asc" },
  })
}

export default async function EntesPage() {
  const entes = await getEntes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entes</h2>
          <p className="text-muted-foreground">
            Gestión de entes adscritos a las empresas
          </p>
        </div>
        <Link
          href="/entes/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Nuevo Ente
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Entes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gerencias</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No hay entes registrados
                    </td>
                  </tr>
                ) : (
                  entes.map((ente) => (
                    <tr key={ente.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{ente.codigo}</td>
                      <td className="px-4 py-3 text-sm font-medium">{ente.nombre}</td>
                      <td className="px-4 py-3 text-sm">{ente.empresa.nombre}</td>
                      <td className="px-4 py-3 text-sm">{ente.tipo}</td>
                      <td className="px-4 py-3 text-sm">{ente._count.gerencia}</td>
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
