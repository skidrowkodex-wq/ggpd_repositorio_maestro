#!/usr/bin/env python3
import os
import re

def convert_md_to_doc(md_path, base_name, out_dir):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    html_lines = []
    in_table = False
    table_header = True

    for line in lines:
        line_str = line.strip()
        if line_str.startswith('|') and line_str.endswith('|'):
            cells = [c.strip() for c in line_str.split('|')[1:-1]]
            if not in_table:
                in_table = True
                table_header = True
                html_lines.append('<table>')
            
            if all(re.match(r'^:?-+:?$', c) for c in cells):
                table_header = False
                continue
                
            if table_header:
                row_html = '<tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr>'
                html_lines.append(row_html)
            else:
                row_html = '<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>'
                html_lines.append(row_html)
        else:
            if in_table:
                in_table = False
                html_lines.append('</table>')
            
            if line_str.startswith('# '):
                html_lines.append(f'<h1>{line_str[2:]}</h1>')
            elif line_str.startswith('## '):
                html_lines.append(f'<h2>{line_str[3:]}</h2>')
            elif line_str.startswith('### '):
                html_lines.append(f'<h3>{line_str[4:]}</h3>')
            elif line_str.startswith('---'):
                html_lines.append('<hr/>')
            elif line_str.startswith('> '):
                html_lines.append(f'<blockquote>{line_str[2:]}</blockquote>')
            elif line_str.startswith('* ') or line_str.startswith('- '):
                html_lines.append(f'<li>{line_str[2:]}</li>')
            elif line_str:
                html_lines.append(f'<p>{line_str}</p>')

    if in_table:
        html_lines.append('</table>')

    html_body = '\n'.join(html_lines)
    html_body = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_body)
    html_body = re.sub(r'`(.*?)`', r'<code>\1</code>', html_body)

    doc_content = f'''<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>{base_name}</title>
<style>
body {{ font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; }}
h1 {{ color: #002b49; border-bottom: 2px solid #002b49; padding-bottom: 8px; font-size: 16pt; }}
h2 {{ color: #003366; margin-top: 20px; font-size: 12pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }}
h3 {{ color: #0f172a; margin-top: 16px; font-size: 10.5pt; }}
table {{ border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 8.5pt; }}
th, td {{ border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left; }}
th {{ background-color: #002b49; color: #ffffff; font-weight: bold; }}
tr:nth-child(even) {{ background-color: #f8fafc; }}
code {{ font-family: 'Consolas', monospace; background: #e2e8f0; padding: 1px 3px; border-radius: 3px; font-size: 8pt; font-weight: bold; color: #0f172a; }}
blockquote {{ border-left: 4px solid #002b49; margin: 10px 0; padding-left: 10px; color: #475569; font-style: italic; font-size: 8.5pt; }}
hr {{ border: 0; height: 1px; background: #cbd5e1; margin: 16px 0; }}
li {{ font-size: 9pt; margin-bottom: 3px; }}
p {{ font-size: 9pt; margin-bottom: 4px; }}
</style>
</head>
<body>
{html_body}
</body>
</html>'''

    target_doc = os.path.join(out_dir, f'{base_name}.doc')
    with open(target_doc, 'w', encoding='utf-8') as f:
        f.write(doc_content)
    print(f'Generated {target_doc} successfully!')

if __name__ == '__main__':
    doc_path = 'docs/despliegues_qa/NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01.md'
    base_name = 'NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01'
    out_dir = 'docs/despliegues_qa'
    convert_md_to_doc(doc_path, base_name, out_dir)
