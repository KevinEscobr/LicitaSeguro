/**
 * Utilidad principal para limpiar textos corruptos provenientes de la API de Mercado Público.
 * Resuelve problemas comunes como la codificación doble (cuando un texto UTF-8 
 * es interpretado como ISO-8859-1 y guardado nuevamente como UTF-8).
 * 
 * @param str Cadena de texto cruda a limpiar (puede ser nula o indefinida).
 * @returns Cadena de texto reparada, sin espacios extra y sin caracteres extraños.
 */
export function cleanText(str: string | null | undefined): string {
  if (!str) return '';
  let cleaned = str;

  // 1. Corrige doble codificación UTF-8
  try {
    if (/[\u00C0-\u00DF][\u0080-\u00BF]/.test(cleaned)) {
      cleaned = decodeURIComponent(escape(cleaned));
    }
  } catch {}

  // 2. Mapeo de secuencias corruptas y entidades HTML comunes
  const replacements: [string, string][] = [
    ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã\u00AD', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'], ['Ãñ', 'ñ'], ['Ã‘', 'Ñ'],
    ['Ã ', 'Á'], ['Ã‰', 'É'], ['Ã ', 'Í'], ['Ã“', 'Ó'], ['Ãš', 'Ú'], ['Ã¼', 'ü'], ['Ãœ', 'Ü'], ['Â°', '°'],
    ['Ã‚Â°', '°'], ['â€“', '–'], ['â€”', '—'], ['â€™', '’'], ['â€˜', '‘'], ['â€œ', '“'], ['â€ ', '”'],
    ['Ã ', 'à'], ['Ã¨', 'è'], ['Ã¬', 'ì'], ['Ã²', 'ò'], ['Ã¹', 'ù'],
    ['&amp;', '&'], ['&quot;', '"'], ['&ldquo;', '“'], ['&rdquo;', '”'], ['&deg;', '°'], ['&nbsp;', ' '],
    ['&#39;', "'"], ['&#241;', 'ñ'], ['&#209;', 'Ñ'], ['&aacute;', 'á'], ['&eacute;', 'é'], ['&iacute;', 'í'],
    ['&oacute;', 'ó'], ['&uacute;', 'ú'], ['&ntilde;', 'ñ'], ['&Ntilde;', 'Ñ'], ['&Aacute;', 'Á'],
    ['&Eacute;', 'É'], ['&Iacute;', 'Í'], ['&Oacute;', 'Ó'], ['&Uacute;', 'Ú']
  ];

  for (const [bad, good] of replacements) {
    cleaned = cleaned.replaceAll(bad, good);
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Función recursiva que recorre profundamente un objeto o array y limpia
 * todos sus valores de tipo string utilizando `cleanText()`.
 */
export function cleanObjectData<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') return cleanText(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(cleanObjectData) as unknown as T;
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, cleanObjectData(v)])
    ) as unknown as T;
  }
  return obj;
}
