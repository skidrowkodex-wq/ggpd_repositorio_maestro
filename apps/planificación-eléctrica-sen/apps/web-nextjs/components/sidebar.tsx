"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Landmark,
  Briefcase,
  Users,
  FileText,
  Target,
  Wallet,
  Package,
  CalendarDays,
  Plane,
  Settings,
} from "lucide-react"

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Estructura Organizativa",
    items: [
      { title: "Empresas", href: "/empresas", icon: Building2 },
      { title: "Entes", href: "/entes", icon: Landmark },
      { title: "Gerencias", href: "/gerencias", icon: Briefcase },
      { title: "Unidades", href: "/unidades", icon: Users },
    ],
  },
  {
    title: "Planificación POA",
    items: [
      { title: "POA", href: "/poa", icon: FileText },
      { title: "Acciones Específicas", href: "/acciones", icon: Target },
      { title: "Metas Físicas", href: "/metas", icon: CalendarDays },
    ],
  },
  {
    title: "Presupuesto",
    items: [
      { title: "Partidas", href: "/partidas", icon: Wallet },
      { title: "Items", href: "/items", icon: Package },
      { title: "Recursos Humanos", href: "/recursos-humanos", icon: Users },
      { title: "Viáticos", href: "/viaticos", icon: Plane },
    ],
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-lg font-semibold text-sidebar-foreground">
          Planificación Eléctrica
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((section, index) => {
          if ("href" in section && section.href) {
            const isActive = pathname === section.href
            return (
              <Link
                key={index}
                href={section.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <section.icon className="h-5 w-5" />
                {section.title}
              </Link>
            )
          }

          return (
            <div key={index} className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                {section.title}
              </h3>
              {section.items?.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
