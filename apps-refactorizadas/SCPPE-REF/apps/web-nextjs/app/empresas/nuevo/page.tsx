import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmpresaForm } from "@/components/empresa-form"

export default function NuevaEmpresaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Empresa</h2>
        <p className="text-muted-foreground">Crear una nueva empresa del sector eléctrico</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <EmpresaForm />
        </CardContent>
      </Card>
    </div>
  )
}
