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

  // 1. Intenta corregir la doble codificación UTF-8
  // Si detecta un patrón de caracteres inválido (ej. Ã¡ para á), fuerza su decodificación.
  try {
    if (/[\u00C0-\u00DF][\u0080-\u00BF]/.test(cleaned)) {
      cleaned = decodeURIComponent(escape(cleaned));
    }
  } catch {
    // Si falla el proceso de escape/decode, ignora el error y usa el reemplazo manual más abajo
  }

  // 2. Mapeo forzado de secuencias corruptas conocidas a su carácter correcto
  // Esto actúa como red de seguridad para los fallos más comunes de la API.
  const replacements: [string, string][] = [
    ['Ã¡', 'á'],
    ['Ã©', 'é'],
    ['Ã­', 'í'],
    ['Ã\u00AD', 'í'],
    ['Ã³', 'ó'],
    ['Ãº', 'ú'],
    ['Ã±', 'ñ'],
    ['Ã‘', 'Ñ'],
    ['Ã ', 'Á'],
    ['Ã‰', 'É'],
    ['Ã ', 'Í'],
    ['Ã“', 'Ó'],
    ['Ãš', 'Ú'],
    ['Ã¼', 'ü'],
    ['Ãœ', 'Ü'],
    ['Â°', '°'],
    ['Ã‚Â°', '°'],
    ['â€“', '–'],
    ['â€”', '—'],
    ['â€™', '’'],
    ['â€˜', '‘'],
    ['â€œ', '“'],
    ['â€ ', '”'],
    ['Ã ', 'à'],
    ['Ã¨', 'è'],
    ['Ã¬', 'ì'],
    ['Ã²', 'ò'],
    ['Ã¹', 'ù'],
    // Entidades HTML comunes que pueden venir directamente en el JSON
    ['&amp;', '&'],
    ['&quot;', '"'],
    ['&ldquo;', '“'],
    ['&rdquo;', '”'],
    ['&deg;', '°'],
    ['&nbsp;', ' '],
    ['&#39;', "'"],
    ['&#241;', 'ñ'],
    ['&#209;', 'Ñ'],
    ['&aacute;', 'á'],
    ['&eacute;', 'é'],
    ['&iacute;', 'í'],
    ['&oacute;', 'ó'],
    ['&uacute;', 'ú'],
    ['&ntilde;', 'ñ'],
    ['&Ntilde;', 'Ñ'],
    ['&Aacute;', 'Á'],
    ['&Eacute;', 'É'],
    ['&Iacute;', 'Í'],
    ['&Oacute;', 'Ó'],
    ['&Uacute;', 'Ú']
  ];

  for (const [bad, good] of replacements) {
    cleaned = cleaned.replaceAll(bad, good);
  }

  // 3. Elimina múltiples espacios consecutivos y quita espacios al inicio/final
  // \s+ busca uno o más espacios en blanco.
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Función recursiva que recorre profundamente un objeto o array y limpia
 * todos sus valores de tipo string utilizando `cleanText()`.
 * Es vital para procesar respuestas complejas y anidadas sin sanitizar campo por campo.
 * 
 * @param obj El objeto, array o valor primitivo crudo proveniente de la API.
 * @returns Una copia limpia del objeto con todos sus textos sanitizados.
 */
export function cleanObjectData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return cleanText(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectData(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleaned[key] = cleanObjectData(obj[key]);
      }
    }
    return cleaned as T;
  }

  return obj;
}
