"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface EnteFormProps {
  empresas: { id: string; nombre: string }[]
}

export function EnteForm({ empresas }: EnteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      empresa_id: formData.get("empresa_id"),
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion") || null,
      tipo: formData.get("tipo") || "OTROS",
    }

    try {
      const response = await fetch("/api/entes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear ente")

      router.push("/entes")
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Empresa *</label>
          <select name="empresa_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Seleccionar empresa...</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código *</label>
          <input type="text" name="codigo" required maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input type="text" name="nombre" required maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="descripcion" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select name="tipo" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="OTROS">OTROS</option>
          <option value="OPERADOR">OPERADOR</option>
          <option value="FUNDACIÓN">FUNDACIÓN</option>
          <option value="ENTE AUTÓNOMO">ENTE AUTÓNOMO</option>
          <option value="ENTE ADSCRITO">ENTE ADSCRITO</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Ente"}
        </button>
      </div>
    </form>
  )
}
