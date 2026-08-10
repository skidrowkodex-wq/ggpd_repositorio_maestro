import os
import json
import re
from typing import Optional, List, Dict

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from flask import current_app


def get_gemini_client():
    if not GEMINI_AVAILABLE:
        return None
    api_key = current_app.config.get('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY', '')
    if not api_key:
        return None
    client = genai.Client(api_key=api_key)
    return client


def get_model(client=None):
    if not GEMINI_AVAILABLE:
        return None
    model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')
    if client is None:
        client = get_gemini_client()
    if client is None:
        return None
    return client.models.get(model_name)


def suggest_cause(original_cause: str, sub_causa: str = '') -> Dict:
    if not GEMINI_AVAILABLE:
        return {'success': False, 'error': 'google-genai package not installed'}
    client = get_gemini_client()
    if client is None:
        return {'success': False, 'error': 'GEMINI_API_KEY not configured'}

    model = get_model(client)
    if model is None:
        return {'success': False, 'error': 'Could not load Gemini model'}

    system_prompt = """Eres un experto en interrupciones eléctricas de CORPOELEC Venezuela.
Tu tarea es homologar causas de interrupción a las 16 causas oficiales del sistema SCTIS.

Las 16 causas oficiales son:
1. MANIOBRA EN LINEA MT
2. SOBRECORRIENTE EN FASE
3. SOBRECORRIENTE EN EL NEUTRO
4. PAC
5. SIN TENSION S/E 115 KV
6. SOBRECORRIENTE EN FASE Y NEUTRO
7. FALLA A TIERRA
8. DAÑO EN CABLE
9. DAÑO EN POSTE
10. DAÑO EN TRANSFORMADOR
11. ROBO DE MATERIAL
12. OBRA EN LA VIA
13. CAIDA DE ARBOL
14. DESLIZAMIENTO
15. HURACAN / TORMENTA
16. OTROS

Responde SOLO en formato JSON válido con este esquema:
{
  "causa_homologada": "nombre de la causa oficial",
  "confianza": 0.0 a 1.0,
  "sub_causa_sugerida": "sub-causa si aplica",
  "justificacion": "breve explicación"
}

Si no puedes determinar la causa, usa "OTROS" con confianza baja."""

    user_prompt = f"""Causa original reportada: "{original_cause}"
Sub-causa: "{sub_causa}"

Homologa esta causa a una de las 16 causas oficiales del sistema SCTIS."""

    try:
        response = model.generate_content(
            [system_prompt, user_prompt],
            generation_config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
            )
        )
        text = response.text.strip()
        json_match = re.search(r'\{[^}]+\}', text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result['success'] = True
            return result
        return {'success': False, 'error': 'No valid JSON in response', 'raw': text}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def batch_suggest_causes(records: List[Dict], batch_size: int = 50) -> List[Dict]:
    if not GEMINI_AVAILABLE:
        return [{'success': False, 'error': 'google-genai package not installed'}] * len(records)
    client = get_gemini_client()
    if client is None:
        return [{'success': False, 'error': 'GEMINI_API_KEY not configured'}] * len(records)

    model = get_model(client)
    if model is None:
        return [{'success': False, 'error': 'Could not load Gemini model'}] * len(records)

    system_prompt = """Eres un experto en interrupciones eléctricas de CORPOELEC Venezuela.
Homologa cada causa de interrupción a las 16 causas oficiales del sistema SCTIS.

Las 16 causas oficiales son:
MANIOBRA EN LINEA MT, SOBRECORRIENTE EN FASE, SOBRECORRIENTE EN EL NEUTRO,
PAC, SIN TENSION S/E 115 KV, SOBRECORRIENTE EN FASE Y NEUTRO,
FALLA A TIERRA, DAÑO EN CABLE, DAÑO EN POSTE, DAÑO EN TRANSFORMADOR,
ROBO DE MATERIAL, OBRA EN LA VIA, CAIDA DE ARBOL, DESLIZAMIENTO,
HURACAN / TORMENTA, OTROS

Responde SOLO un array JSON. Cada objeto debe tener:
causa_original, causa_homologada, confianza (0-1), justificacion"""

    results = []
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        causes_text = '; '.join([f"{r.get('causa','')} | {r.get('sub_causa','')}" for r in batch])
        user_prompt = f"Causas a homologar:\n{causes_text}\n\nResponde con el array JSON."

        try:
            response = model.generate_content(
                [system_prompt, user_prompt],
                generation_config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=2000,
                )
            )
            text = response.text.strip()
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                batch_results = json.loads(json_match.group())
                for r in batch_results:
                    r['success'] = True
                results.extend(batch_results)
            else:
                results.extend([{'success': False, 'error': 'No valid JSON in response', 'raw': text}] * len(batch))
        except Exception as e:
            results.extend([{'success': False, 'error': str(e)}] * len(batch))

    return results


def evaluate_quality_with_ai(record: Dict) -> Dict:
    if not GEMINI_AVAILABLE:
        return {'success': False, 'error': 'google-genai package not installed'}
    client = get_gemini_client()
    if client is None:
        return {'success': False, 'error': 'GEMINI_API_KEY not configured'}

    model = get_model(client)
    if model is None:
        return {'success': False, 'error': 'Could not load Gemini model'}

    system_prompt = """Eres un auditor de calidad de datos de interrupciones eléctricas (ISO 8000).
Evalúa la calidad de un registro de tira de interrupción y devuelve un score de 0-100.

Responde SOLO en formato JSON:
{
  "score": 0-100,
  "issues": ["lista de problemas encontrados"],
  "suggestions": ["sugerencias para mejorar"],
  "estado_calculo": "CALCULO VALIDO" o "REVISAR CALCULO"
}"""

    record_str = json.dumps(record, ensure_ascii=False, indent=2)
    user_prompt = f"Evalúa la calidad de este registro:\n{record_str}"

    try:
        response = model.generate_content(
            [system_prompt, user_prompt],
            generation_config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=500,
            )
        )
        text = response.text.strip()
        json_match = re.search(r'\{[^}]+\}', text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result['success'] = True
            return result
        return {'success': False, 'error': 'No valid JSON in response', 'raw': text}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def detect_duplicates_with_ai(records: List[Dict]) -> List[Dict]:
    if not GEMINI_AVAILABLE:
        return [{'success': False, 'error': 'google-genai package not installed'}] * len(records)
    client = get_gemini_client()
    if client is None:
        return [{'success': False, 'error': 'GEMINI_API_KEY not configured'}] * len(records)

    model = get_model(client)
    if model is None:
        return [{'success': False, 'error': 'Could not load Gemini model'}] * len(records)

    system_prompt = """Eres un sistema de detección de duplicados para tiras de interrupción eléctrica.
Analiza pares de registros y determina si son duplicados potenciales.

Responde SOLO un array JSON. Cada objeto debe tener:
index1, index2, es_duplicado (true/false), confianza (0-1), razon"""

    truncated = len(records) > 20
    pairs_text = ''
    for i in range(min(len(records), 20)):
        for j in range(i + 1, min(len(records), 20)):
            pairs_text += f"Par {i}-{j}: {json.dumps(records[i], ensure_ascii=False)} vs {json.dumps(records[j], ensure_ascii=False)}\n"

    user_prompt = f"Analiza estos pares de registros para detectar duplicados:\n{pairs_text}"

    try:
        response = model.generate_content(
            [system_prompt, user_prompt],
            generation_config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=3000,
            )
        )
        text = response.text.strip()
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            results = json.loads(json_match.group())
            for r in results:
                r['success'] = True
            if truncated:
                results.append({'warning': f'Solo se analizaron 20 de {len(records)} registros. Los {len(records) - 20} restantes no fueron evaluados.'})
            return results
        return [{'success': False, 'error': 'No valid JSON in response'}]
    except Exception as e:
        return [{'success': False, 'error': str(e)}]