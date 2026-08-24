"""Genera los documentos SCTIS (técnico, funcional, instructivos, cronograma) en .doc, .md y .docx.

Salidas en docs/:
  SCTIS_DOCTEC_v1_Arquitectura_Flujos.doc / .md / .docx
  SCTIS_DOCFUN_v1_Beneficios_Decision.doc / .md / .docx
  SCTIS_INSTRUCTIVO_v1_Procedimiento_Estados.doc / .md / .docx
  SCTIS_INSTRUCTIVO_v1_Administradores_Supervisores.doc / .md / .docx
  SCTIS_CRONO_v1_Implementacion_Piloto.doc / .md / .docx
"""
import os
from renderizador import render_markdown, render_docx, render_doc
import contenido_doctec as doctec
import contenido_docfun as docfun
import contenido_instructivo as instructivo
import contenido_instructivo_admin as instructivo_admin
import contenido_cronograma as cronograma

DOCS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docs')
ROOT_DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs'))
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(ROOT_DOCS_DIR, exist_ok=True)


def generar(contenido, nombre_base, doc_codigo, extra_pie=""):
    for target_dir in [DOCS_DIR, ROOT_DOCS_DIR]:
        md_path = os.path.join(target_dir, f'{nombre_base}.md')
        doc_path = os.path.join(target_dir, f'{nombre_base}.doc')
        docx_path = os.path.join(target_dir, f'{nombre_base}.docx')

        # 1. Markdown
        md = render_markdown(contenido.BLOCKS, contenido.TITULO, contenido.SUBTITULO, contenido.SISTEMA)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f'Markdown generado: {md_path}')

        # 2. Documento Google Drive / Word (.doc)
        render_doc(contenido.BLOCKS, contenido.TITULO, contenido.SUBTITULO,
                   contenido.SISTEMA, doc_codigo, doc_path,
                   fecha=contenido.FECHA, extra_pie=extra_pie)
        print(f'Documento .doc (Google Drive) generado: {doc_path}')

        # 3. Documento Word (.docx)
        render_docx(contenido.BLOCKS, contenido.TITULO, contenido.SUBTITULO,
                    contenido.SISTEMA, doc_codigo, docx_path,
                    fecha=contenido.FECHA, extra_pie=extra_pie)
        print(f'Documento .docx generado: {docx_path}')


if __name__ == '__main__':
    generar(doctec, 'SCTIS_DOCTEC_v1_Arquitectura_Flujos', doctec.DOC_CODIGO)
    generar(docfun, 'SCTIS_DOCFUN_v1_Beneficios_Decision', docfun.DOC_CODIGO)
    generar(instructivo, 'SCTIS_INSTRUCTIVO_v1_Procedimiento_Estados', instructivo.DOC_CODIGO)
    generar(instructivo_admin, 'SCTIS_INSTRUCTIVO_v1_Administradores_Supervisores',
            instructivo_admin.DOC_CODIGO)
    generar(cronograma, 'SCTIS_CRONO_v1_Implementacion_Piloto', cronograma.DOC_CODIGO)
    print('\n✅ Todos los documentos fueron generados en formatos .doc (Google Drive), .md y .docx.')

