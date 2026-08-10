import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Configuración del sistema de Planificación Eléctrica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Framework:</span> Next.js 16</p>
            <p><span className="font-medium">ORM:</span> Prisma 7</p>
            <p><span className="font-medium">Base de datos:</span> PostgreSQL 17</p>
            <p><span className="font-medium">CSS:</span> TailwindCSS 4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Host:</span> 127.0.0.1:5432</p>
            <p><span className="font-medium">Base de datos:</span> planificacion_electrica</p>
            <p><span className="font-medium">Estado:</span> Conectado</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
