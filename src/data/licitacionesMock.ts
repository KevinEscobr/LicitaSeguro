export interface TenderItem {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  descripcion: string;
  codigoProducto?: number;       // Código ONU del producto
  categoriaProducto?: string;    // Categoría ONU completa
}

export interface TenderTimeline {
  fechaCreacion?: string;
  fechaPublicacion?: string;
  fechaCierre?: string;
  fechaInicio?: string;              // Inicio de preguntas
  fechaFinal?: string;               // Fin de preguntas
  fechaPubRespuestas?: string;       // Publicación de respuestas
  fechaActoAperturaTecnica?: string;
  fechaActoAperturaEconomica?: string;
  fechaAdjudicacion?: string;
  fechaEstimadaAdjudicacion?: string;
  fechaVisitaTerreno?: string;
  fechaEntregaAntecedentes?: string;
  fechaSoporteFisico?: string;
}

export interface TenderComprador {
  nombreOrganismo: string;
  rutUnidad: string;
  nombreUnidad?: string;            // Unidad de compra específica
  direccionUnidad?: string;
  comunaUnidad?: string;
  regionUnidad?: string;
  nombreUsuario?: string;           // Responsable real
  cargoUsuario?: string;
}

export interface Tender {
  id: string; // e.g., "5215-45-LP26"
  titulo: string;
  descripcion: string;
  estado: 'Publicada' | 'Cerrada' | 'Adjudicada' | 'Desierta' | 'Revocada' | 'Suspendida';
  
  // Organismo / Comprador
  organismo: string;
  rutOrganismo: string;
  comprador?: TenderComprador;
  
  // Fechas principales (compat)
  fechaPublicacion: string; // ISO Date YYYY-MM-DD
  fechaCierre: string; // ISO Date YYYY-MM-DD
  fechaAdjudicacion?: string; // ISO Date YYYY-MM-DD
  
  // Timeline completo
  timeline?: TenderTimeline;
  
  // Presupuesto
  montoEstimado: number; // In the specified currency
  moneda: string;                    // CLP, USD, UTM, EUR, etc.
  visibilidadMonto: number;          // 0 = reservado, 1 = público
  tipoEstimacion?: number;           // 1 = monto fijo, 2 = referencial
  fuenteFinanciamiento?: string;
  
  // Metadata de la licitación
  tipoLicitacion?: string;           // LE, LP, LR, etc.
  etapas?: number;                    // 1 o 2
  diasCierre?: number;
  
  // Contrato
  duracionContrato?: string;
  unidadTiempoDuracionContrato?: number; // 1=días, 2=meses, 3=años
  
  // Contacto del proceso
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  nombreResponsablePago?: string;
  
  // Items
  items: TenderItem[];
  
  // Adjudicación
  proveedorAdjudicadoRUT?: string;
  proveedorAdjudicadoNombre?: string;
  montoAdjudicado?: number;
  adjudicacionFecha?: string;
  adjudicacionNumero?: string;
  adjudicacionUrlActa?: string;
  adjudicacionNumeroOferentes?: number;
}

// Legacy mock data kept as reference — the app now uses live API data
export const licitacionesMock: Tender[] = [];
