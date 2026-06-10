import { Tender, TenderItem } from '@/data/licitacionesMock';
import { cleanObjectData } from '@/lib/cleanData';

// Define estructuras de datos para tipado estricto de las respuestas de la API de Mercado Público
interface ApiComprador {
  CodigoOrganismo?: string;
  NombreOrganismo?: string;
  RutUnidad?: string;
  CodigoUnidad?: string;
  NombreUnidad?: string;
  DireccionUnidad?: string;
  ComunaUnidad?: string;
  RegionUnidad?: string;
  RutUsuario?: string;
  CodigoUsuario?: string;
  NombreUsuario?: string;
  CargoUsuario?: string;
}

interface ApiAdjudicacion {
  RutProveedor?: string;
  NombreProveedor?: string;
  Cantidad?: number;
  PrecioUnitario?: number;
  MontoUnitario?: number;
}

interface ApiItem {
  Correlativo?: number;
  CodigoProducto?: number;
  CodigoCategoria?: string;
  Categoria?: string;
  NombreProducto?: string;
  Cantidad?: number;
  UnidadMedida?: string;
  Descripcion?: string;
  Adjudicacion?: ApiAdjudicacion | null;
}

interface ApiRootAdjudicacion {
  Tipo?: number;
  Fecha?: string;
  Numero?: string;
  NumeroOferentes?: number;
  UrlActa?: string;
}

interface ApiFechas {
  FechaCreacion?: string;
  FechaCierre?: string;
  FechaInicio?: string;
  FechaFinal?: string;
  FechaPubRespuestas?: string;
  FechaActoAperturaTecnica?: string;
  FechaActoAperturaEconomica?: string;
  FechaPublicacion?: string;
  FechaAdjudicacion?: string;
  FechaEstimadaAdjudicacion?: string;
  FechaSoporteFisico?: string;
  FechaTiempoEvaluacion?: string;
  FechaEstimadaFirma?: string;
  FechaVisitaTerreno?: string;
  FechaEntregaAntecedentes?: string;
}

interface ApiLicitacion {
  CodigoExterno: string;
  Nombre: string;
  Descripcion: string;
  CodigoEstado: number;
  FechaCierre?: string | null;
  FechaPublicacion?: string | null;
  FechaAdjudicacion?: string | null;
  MontoEstimado?: number | null;
  Comprador?: ApiComprador;
  Items?: {
    Cantidad?: number;
    Listado?: ApiItem[];
  };
  ContactoNombre?: string;
  ContactoEmail?: string;
  ContactoTelefono?: string;

  // New detail fields
  DiasCierreLicitacion?: string | number;
  Tipo?: string;
  Moneda?: string;
  Etapas?: number;
  Contrato?: string;
  Estimacion?: number;
  FuenteFinanciamiento?: string;
  VisibilidadMonto?: number;
  NombreResponsablePago?: string;
  UnidadTiempoDuracionContrato?: number;
  TiempoDuracionContrato?: string;
  Adjudicacion?: ApiRootAdjudicacion | null;
  Fechas?: ApiFechas;
}

interface ApiResponse {
  Cantidad: number;
  FechaCreacion: string;
  Version: string;
  Listado?: ApiLicitacion[];
}

/**
 * Mapeo de estados: 
 * La API de Mercado Público devuelve códigos numéricos. Esta función los 
 * traduce a los estados utilizados localmente en la interfaz de usuario.
 * 
 * Códigos conocidos:
 * 5: Publicada, 6: Cerrada, 7: Desierta, 8: Adjudicada, 18: Revocada, 19: Suspendida
 * 
 * @param codigoEstado El código numérico devuelto por la API.
 * @returns El estado local de la licitación en formato string.
 */
function mapEstado(codigoEstado: number): Tender['estado'] {
  switch (codigoEstado) {
    case 5:
      return 'Publicada';
    case 6:
    case 19:
      return 'Cerrada';
    case 7:
      return 'Desierta';
    case 8:
      return 'Adjudicada';
    case 18:
      return 'Revocada';
    default:
      return 'Publicada';
  }
}

/**
 * Formateador de fechas helper.
 * Extrae solo la porción "YYYY-MM-DD" de una fecha ISO ("YYYY-MM-DDTHH:mm:ss").
 * 
 * @param dateStr Fecha en formato string a formatear.
 * @returns La fecha truncada, o la cadena original en caso de error.
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    return dateStr.split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Helper inteligente para extraer la cantidad real de un producto desde su descripción textual.
 * Muchos compradores colocan "1" o "0" en el campo estructurado de "Cantidad" por defecto,
 * y especifican la verdadera cantidad en texto libre (ej: "Se estima en 1.500 unidades").
 * 
 * @param descripcion El texto libre provisto por el comprador.
 * @param apiCantidad La cantidad estructurada reportada por la API.
 * @returns La cantidad extraída si fue exitoso, o la cantidad de la API como respaldo.
 */
function parseCantidadFromDescripcion(descripcion: string | null | undefined, apiCantidad: number): number {
  if (!descripcion) return apiCantidad;

  // Normalmente solo sobrescribimos si la cantidad de la API es 1 o 0 (valores de relleno típicos)
  if (apiCantidad !== 1 && apiCantidad !== 0) return apiCantidad;

  const patterns = [
    /(?:se estima en|estimado en|estimada en|estimado de|estimada de|aproximada de|aproximado de|aprox\.?|cantidad de|total de|aproximado:?|aproximada:?)\s+([\d]{1,3}(?:\.[\d]{3})+)(?:\s*(?:litros|lts|l|unidades|unid|kgs|kg|toneladas|ton|m3|m2|un|unidad|unidades|uds|ud|g|gr|gramos|cc))?/i,
    /(?:se estima en|estimado en|estimada en|estimado de|estimada de|aproximada de|aproximado de|aprox\.?|cantidad de|total de|aproximado:?|aproximada:?)\s+([\d.]+)(?:\s*(?:litros|lts|l|unidades|unid|kgs|kg|toneladas|ton|m3|m2|un|unidad|unidades|uds|ud|g|gr|gramos|cc))/i,
    /(?:se estima en|estimado en|estimada en)\s+([\d.]+)/i
  ];

  for (const pattern of patterns) {
    const match = descripcion.match(pattern);
    if (match && match[1]) {
      let numStr = match[1];
      // Tratar el punto como separador de miles y la coma como separador decimal
      numStr = numStr.replace(/\./g, '').replace(/,/g, '.');
      const parsed = parseFloat(numStr);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return apiCantidad;
}

/**
 * Transforma un objeto `ApiLicitacion` puro (proveniente de la API) en un objeto local 
 * `Tender` estructurado para ser consumido fácilmente por los componentes UI.
 * 
 * @param apiLic El objeto en bruto de la licitación.
 * @returns Objeto de licitación formateado y mapeado a las interfaces locales.
 */
function mapApiLicitacion(apiLic: ApiLicitacion): Tender {
  const id = apiLic.CodigoExterno;

  // 1. Extracción y mapeo de los items (productos/servicios) solicitados
  const apiItems = apiLic.Items?.Listado || [];
  const items: TenderItem[] = apiItems.map((item, index) => ({
    id: item.Correlativo?.toString() || (index + 1).toString(),
    nombre: item.NombreProducto || 'Producto / Servicio',
    cantidad: parseCantidadFromDescripcion(item.Descripcion, item.Cantidad || 1),
    unidad: item.UnidadMedida || 'Unidades',
    descripcion: item.Descripcion || '',
    codigoProducto: item.CodigoProducto,
    categoriaProducto: item.Categoria,
  }));

  // 2. Extracción de detalles de adjudicación (si la licitación ya se cerró y adjudicó)
  // Busca el ganador en la lista de items.
  let proveedorAdjudicadoRUT: string | undefined;
  let proveedorAdjudicadoNombre: string | undefined;
  let montoAdjudicado: number | undefined;

  const firstAwardedItem = apiItems.find(item => item.Adjudicacion && item.Adjudicacion.RutProveedor);
  if (firstAwardedItem && firstAwardedItem.Adjudicacion) {
    proveedorAdjudicadoRUT = firstAwardedItem.Adjudicacion.RutProveedor;
    proveedorAdjudicadoNombre = firstAwardedItem.Adjudicacion.NombreProveedor;

    // Suma todos los montos de adjudicación unitarios disponibles
    montoAdjudicado = apiItems.reduce((acc, curr) => {
      if (curr.Adjudicacion) {
        const price = curr.Adjudicacion.MontoUnitario ?? curr.Adjudicacion.PrecioUnitario ?? 0;
        const qty = curr.Adjudicacion.Cantidad ?? curr.Cantidad ?? 1;
        return acc + (price * qty);
      }
      return acc;
    }, 0);

    if (montoAdjudicado === 0 && apiLic.MontoEstimado) {
      // Valor por defecto sensato (95%) si el monto no está especificado a nivel de items
      montoAdjudicado = apiLic.MontoEstimado * 0.95; 
    }
  }

  // 3. Mapeo de la entidad compradora
  const comprador = {
    nombreOrganismo: apiLic.Comprador?.NombreOrganismo || 'Organismo Público',
    rutUnidad: apiLic.Comprador?.RutUnidad || 'N/A',
    nombreUnidad: apiLic.Comprador?.NombreUnidad,
    direccionUnidad: apiLic.Comprador?.DireccionUnidad,
    comunaUnidad: apiLic.Comprador?.ComunaUnidad,
    regionUnidad: apiLic.Comprador?.RegionUnidad,
    nombreUsuario: apiLic.Comprador?.NombreUsuario,
    cargoUsuario: apiLic.Comprador?.CargoUsuario,
  };

  // 4. Mapeo estructurado del cronograma de fechas
  const timeline = {
    fechaCreacion: apiLic.Fechas?.FechaCreacion ? formatDate(apiLic.Fechas.FechaCreacion) : undefined,
    fechaPublicacion: apiLic.Fechas?.FechaPublicacion ? formatDate(apiLic.Fechas.FechaPublicacion) : undefined,
    fechaCierre: apiLic.Fechas?.FechaCierre ? formatDate(apiLic.Fechas.FechaCierre) : undefined,
    fechaInicio: apiLic.Fechas?.FechaInicio ? formatDate(apiLic.Fechas.FechaInicio) : undefined,
    fechaFinal: apiLic.Fechas?.FechaFinal ? formatDate(apiLic.Fechas.FechaFinal) : undefined,
    fechaPubRespuestas: apiLic.Fechas?.FechaPubRespuestas ? formatDate(apiLic.Fechas.FechaPubRespuestas) : undefined,
    fechaActoAperturaTecnica: apiLic.Fechas?.FechaActoAperturaTecnica ? formatDate(apiLic.Fechas.FechaActoAperturaTecnica) : undefined,
    fechaActoAperturaEconomica: apiLic.Fechas?.FechaActoAperturaEconomica ? formatDate(apiLic.Fechas.FechaActoAperturaEconomica) : undefined,
    fechaAdjudicacion: apiLic.Fechas?.FechaAdjudicacion ? formatDate(apiLic.Fechas.FechaAdjudicacion) : undefined,
    fechaEstimadaAdjudicacion: apiLic.Fechas?.FechaEstimadaAdjudicacion ? formatDate(apiLic.Fechas.FechaEstimadaAdjudicacion) : undefined,
    fechaVisitaTerreno: apiLic.Fechas?.FechaVisitaTerreno ? formatDate(apiLic.Fechas.FechaVisitaTerreno) : undefined,
    fechaEntregaAntecedentes: apiLic.Fechas?.FechaEntregaAntecedentes ? formatDate(apiLic.Fechas.FechaEntregaAntecedentes) : undefined,
    fechaSoporteFisico: apiLic.Fechas?.FechaSoporteFisico ? formatDate(apiLic.Fechas.FechaSoporteFisico) : undefined,
  };

  return {
    id,
    titulo: apiLic.Nombre || 'Licitación sin título',
    descripcion: apiLic.Descripcion || apiLic.Nombre || 'Sin descripción disponible',
    estado: mapEstado(apiLic.CodigoEstado),
    organismo: comprador.nombreOrganismo,
    rutOrganismo: comprador.rutUnidad,
    comprador,
    fechaPublicacion: formatDate(apiLic.Fechas?.FechaPublicacion || apiLic.FechaPublicacion || undefined) || formatDate(apiLic.FechaPublicacion),
    fechaCierre: formatDate(apiLic.Fechas?.FechaCierre || apiLic.FechaCierre || undefined) || formatDate(apiLic.FechaCierre),
    fechaAdjudicacion: (apiLic.Fechas?.FechaAdjudicacion || apiLic.FechaAdjudicacion) ? formatDate(apiLic.Fechas?.FechaAdjudicacion || apiLic.FechaAdjudicacion) : undefined,
    timeline,
    montoEstimado: apiLic.MontoEstimado || 0,
    moneda: apiLic.Moneda || 'CLP',
    visibilidadMonto: apiLic.VisibilidadMonto !== undefined ? apiLic.VisibilidadMonto : 1,
    tipoEstimacion: apiLic.Estimacion,
    fuenteFinanciamiento: apiLic.FuenteFinanciamiento,
    tipoLicitacion: apiLic.Tipo,
    etapas: apiLic.Etapas,
    diasCierre: (() => {
      const cierre = apiLic.Fechas?.FechaCierre || apiLic.FechaCierre;
      if (!cierre) return undefined;
      const cierreDate = new Date(cierre);
      const now = new Date();
      const diffMs = cierreDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    })(),
    duracionContrato: apiLic.TiempoDuracionContrato,
    unidadTiempoDuracionContrato: apiLic.UnidadTiempoDuracionContrato,
    contactoNombre: apiLic.ContactoNombre || apiLic.Comprador?.NombreUsuario || 'Contacto del Proceso',
    contactoEmail: apiLic.ContactoEmail || 'contacto@mercado-publico.cl',
    contactoTelefono: apiLic.ContactoTelefono || '+56 2 2900 0000',
    nombreResponsablePago: apiLic.NombreResponsablePago,
    items,
    proveedorAdjudicadoRUT,
    proveedorAdjudicadoNombre,
    montoAdjudicado,
    adjudicacionFecha: apiLic.Adjudicacion?.Fecha ? formatDate(apiLic.Adjudicacion.Fecha) : undefined,
    adjudicacionNumero: apiLic.Adjudicacion?.Numero,
    adjudicacionUrlActa: apiLic.Adjudicacion?.UrlActa,
    adjudicacionNumeroOferentes: apiLic.Adjudicacion?.NumeroOferentes,
  };
}

/**
 * Función principal para comunicarse con la API de Mercado Público.
 * 
 * @param queryParams Objeto clave/valor de los parámetros de búsqueda a enviar a la API.
 * @returns Array de Licitaciones (`Tender`) procesadas y mapeadas.
 */
async function callMercadoPublicoApi(queryParams: Record<string, string>): Promise<Tender[]> {
  const ticket = process.env.MERCADO_PUBLICO_TICKET || '05F86DBB-915B-4367-9D76-781FFF34EFE2';
  const url = new URL('https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json');
  
  // Configurar los parámetros en la URL
  url.searchParams.set('ticket', ticket);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Establecer un timeout de 8 segundos para evitar bloqueos por latencia de la API
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      console.warn(`Mercado Publico API returned status ${response.status}`);
      throw new Error('API_DOWN');
    }

    const rawData = await response.json();
    const data: ApiResponse = cleanObjectData(rawData);
    const apiList = data.Listado;

    if (!apiList || !Array.isArray(apiList)) {
      console.warn('Mercado Publico API response has no Listado array or is empty', data);
      return [];
    }

    return apiList.map(mapApiLicitacion);
  } catch (error: any) {
    console.error('Error calling Mercado Publico API:', error);
    throw new Error(`API_DOWN: ${error.message}`);
  }
}

/**
 * Obtiene el listado de licitaciones desde Mercado Público.
 * Soporta filtros por fecha (fecha de publicación) o por estado.
 * 
 * @param params Parámetros de filtro opcionales (`fecha`, `estado`).
 */
export async function getLicitaciones(params: { fecha?: string; estado?: string } = {}): Promise<Tender[]> {
  const queryParams: Record<string, string> = {};

  if (params.fecha) {
    // Convierte el formato estándar YYYY-MM-DD de Next.js al formato DDMMYYYY requerido por la API
    const parts = params.fecha.split('-');
    if (parts.length === 3) {
      queryParams.fecha = `${parts[2]}${parts[1]}${parts[0]}`;
    } else {
      queryParams.fecha = params.fecha;
    }
  } else if (params.estado) {
    queryParams.estado = params.estado;
  } else {
    // Si no hay parámetros, solicita por defecto solo las activas para no sobrecargar datos históricos
    queryParams.estado = 'activas';
  }

  return await callMercadoPublicoApi(queryParams);
}

/**
 * Obtiene el detalle completo de una licitación a través de su código externo (ID público).
 * 
 * @param id El código externo de la licitación (ej: '5215-12-LP26').
 * @returns El objeto de la licitación o nulo si no existe.
 */
export async function getLicitacionById(id: string): Promise<Tender | null> {
  const apiTenders = await callMercadoPublicoApi({ codigo: id });

  if (apiTenders.length > 0) {
    return apiTenders[0];
  }
  return null;
}
