"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Unidad {
  id: string
  nombre: string
  gerencia: {
    nombre: string
    ente: {
      nombre: string
    }
  }
}

interface POAFormProps {
  unidades: Unidad[]
}

export function POAForm({ unidades }: POAFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      unidad_id: formData.get("unidad_id"),
      anio: parseInt(formData.get("anio") as string),
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      fecha_inicio: formData.get("fecha_inicio") || null,
      fecha_fin: formData.get("fecha_fin") || null,
      politica_sen: formData.get("politica_sen") || null,
      programa_sen: formData.get("programa_sen") || null,
      codigo_sipes: formData.get("codigo_sipes") || null,
      organismo_responsable: formData.get("organismo_responsable") || null,
      unidad_ejecutora_local: formData.get("unidad_ejecutora_local") || null,
      objetivo_especifico_unidad: formData.get("objetivo_especifico_unidad") || null,
      responsable_ejecucion_nombre: formData.get("responsable_ejecucion_nombre") || null,
      cargo_responsable: formData.get("cargo_responsable") || null,
      es_plurianual: formData.get("es_plurianual") === "on",
      situacion_presupuestaria: formData.get("situacion_presupuestaria") || "POR INICIAR",
      responsable_tecnico_nombre: formData.get("responsable_tecnico_nombre") || null,
      responsable_tecnico_email: formData.get("responsable_tecnico_email") || null,
      responsable_admin_nombre: formData.get("responsable_admin_nombre") || null,
      responsable_admin_email: formData.get("responsable_admin_email") || null,
      localizacion: formData.get("localizacion") || null,
    }

    try {
      const response = await fetch("/api/poa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al crear el POA")
      }

      router.push("/poa")
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
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Unidad Ejecutora *
          </label>
          <select
            name="unidad_id"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Seleccionar unidad...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.gerencia.ente.nombre} → {u.gerencia.nombre} → {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Año *
          </label>
          <input
            type="number"
            name="anio"
            required
            min={2020}
            max={2050}
            defaultValue={2027}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Código *
          </label>
          <input
            type="text"
            name="codigo"
            required
            maxLength={50}
            placeholder="POA-2027-001"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            required
            maxLength={255}
            placeholder="Plan Operativo Anual 2027"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            name="fecha_inicio"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            name="fecha_fin"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Política SEN
          </label>
          <input
            type="text"
            name="politica_sen"
            maxLength={255}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Programa SEN
          </label>
          <input
            type="text"
            name="programa_sen"
            maxLength={255}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Código SIPES
          </label>
          <input
            type="text"
            name="codigo_sipes"
            maxLength={50}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Organismo Responsable
          </label>
          <input
            type="text"
            name="organismo_responsable"
            maxLength={255}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="es_plurianual"
          id="es_plurianual"
          className="h-4 w-4"
        />
        <label htmlFor="es_plurianual" className="text-sm font-medium">
          Es Plurianual
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar POA"}
        </button>
      </div>
    </form>
  )
}
