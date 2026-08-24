"""Genera todos los diagramas SCTIS en SVG (docs/diagramas/).

- 8 diagramas de secuencia por carriles (POOL por elemento del sistema)
- 1 diagrama de casos de uso

Uso: python3 -m diagramas.generar_diagramas
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from secuencias import Secuencia, guardar
from datos_secuencias import DIAGRAMAS
import casos_uso


def main():
    os.makedirs("docs/diagramas", exist_ok=True)

    nombres = [
        "secuencia_importacion",
        "secuencia_auditoria",
        "secuencia_calidad",
        "secuencia_dashboard",
        "secuencia_tareas",
        "secuencia_aprendizaje",
        "secuencia_aprobacion",
        "secuencia_login",
    ]
    for nombre, data in zip(nombres, DIAGRAMAS):
        guardar(nombre, Secuencia(**data))

    out = "docs/diagramas/casos_uso.svg"
    with open(out, "w") as f:
        f.write(casos_uso.render())
    print("SVG:", out)

    print("\n✅ Diagramas generados en docs/diagramas/")


if __name__ == "__main__":
    main()
