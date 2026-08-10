"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ViaticoFormProps {
  partidas: { id: string; nombre: string; codigo: string }[]
}

export function ViaticoForm({ partidas }: ViaticoFormProps) {
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
      concepto: formData.get("concepto"),
      numero_personas: parseInt(formData.get("numero_personas") as string),
      dias: parseInt(formData.get("dias") as string),
      costo_unitario: formData.get("costo_unitario") || 0,
    }

    try {
      const response = await fetch("/api/viaticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear viático")

      router.push("/viaticos")
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
        <label className="block text-sm font-medium mb-1">Partida Presupuestaria *</label>
        <select name="partida_presupuestaria_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar partida...</option>
          {partidas.map((p) => (
            <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Concepto *</label>
        <input type="text" name="concepto" required maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Número de Personas *</label>
          <input type="number" name="numero_personas" required min={1} defaultValue={1} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Días *</label>
          <input type="number" name="dias" required min={1} defaultValue={1} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Costo Unitario (por persona/día)</label>
          <input type="number" name="costo_unitario" min={0} step={0.01} defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Viático"}
        </button>
      </div>
    </form>
  )
}
