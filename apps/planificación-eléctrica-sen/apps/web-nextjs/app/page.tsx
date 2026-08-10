import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, Target, Wallet } from "lucide-react"

async function getStats() {
  const [empresas, entes, gerencias, poas, acciones, partidas] = await Promise.all([
    prisma.empresa.count({ where: { activo: true } }),
    prisma.ente.count({ where: { activo: true } }),
    prisma.gerencia.count({ where: { activo: true } }),
    prisma.poa.count({ where: { activo: true } }),
    prisma.accion_especifica.count({ where: { activo: true } }),
    prisma.partida_presupuestaria.count({ where: { activo: true } }),
  ])

  const totalPresupuesto = await prisma.partida_presupuestaria.aggregate({
    where: { activo: true },
    _sum: { monto_presupuestado: true },
  })

  return {
    empresas,
    entes,
    gerencias,
    poas,
    acciones,
    partidas,
    totalPresupuesto: totalPresupuesto._sum.monto_presupuestado ?? 0,
  }
}

export default async function HomePage() {
  const stats = await getStats()

  const cards = [
    {
      title: "Empresas",
      value: stats.empresas,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "POA Activos",
      value: stats.poas,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Acciones Específicas",
      value: stats.acciones,
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Presupuesto Total",
      value: `Bs. ${stats.totalPresupuesto.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "text-amber-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen del sistema de Planificación Eléctrica - POA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Estructura Organizativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entes</span>
                <span className="font-medium">{stats.entes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gerencias</span>
                <span className="font-medium">{stats.gerencias}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Partidas Presupuestarias</span>
                <span className="font-medium">{stats.partidas}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Base de datos:</span> PostgreSQL 17
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">ORM:</span> Prisma 7
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Framework:</span> Next.js 16
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Estado:</span> Desarrollo local
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
