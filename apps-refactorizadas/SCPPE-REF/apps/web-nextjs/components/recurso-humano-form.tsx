"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface RecursoHumanoFormProps {
  partidas: { id: string; nombre: string; codigo: string }[]
}

export function RecursoHumanoForm({ partidas }: RecursoHumanoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      partida_presupuestaria_id: formData.get("partida_presupuestaria_id"),
      rol_funcional: formData.get("rol_funcional"),
      dedicacion_meses: parseInt(formData.get("dedicacion_meses") as string),
      costo_mensual: formData.get("costo_mensual") || 0,
    }

    try {
      const response = await fetch("/api/recursos-humanos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear recurso humano")

      router.push("/recursos-humanos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Partida Presupuestaria (402) *</label>
        <select name="partida_presupuestaria_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar partida...</option>
          {partidas.map((p) => (
            <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol Funcional *</label>
        <input type="text" name="rol_funcional" required maxLength={255} placeholder="Ej: Ingeniero de Proyectos, Analista, etc." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Dedicación (meses) *</label>
          <input type="number" name="dedicacion_meses" required min={1} max={12} defaultValue={12} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Costo Mensual (Bs.) *</label>
          <input type="number" name="costo_mensual" required min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Recurso Humano"}
        </button>
      </div>
    </form>
  )
}
