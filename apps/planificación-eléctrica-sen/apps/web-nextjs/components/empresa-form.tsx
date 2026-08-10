"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function EmpresaForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      rif: formData.get("rif") || null,
      direccion: formData.get("direccion") || null,
      telefono: formData.get("telefono") || null,
      email: formData.get("email") || null,
      tipo: formData.get("tipo") || "PÚBLICA",
      ambito: formData.get("ambito") || "NACIONALES",
    }

    try {
      const response = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al crear empresa")

      router.push("/empresas")
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
          <label className="block text-sm font-medium mb-1">Código *</label>
          <input type="text" name="codigo" required maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RIF</label>
          <input type="text" name="rif" maxLength={20} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input type="text" name="nombre" required maxLength={255} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dirección</label>
        <textarea name="direccion" rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input type="text" name="telefono" maxLength={50} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" maxLength={100} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select name="tipo" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="PÚBLICA">PÚBLICA</option>
            <option value="PRIVADA">PRIVADA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ámbito</label>
          <select name="ambito" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="NACIONALES">NACIONALES</option>
            <option value="INTERNACIONALES">INTERNACIONALES</option>
            <option value="MIXTAS">MIXTAS</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar Empresa"}
        </button>
      </div>
    </form>
  )
}
