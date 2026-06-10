export interface HistoricalTender {
  licitacionId: string;
  titulo: string;
  organismo: string;
  fecha: string;
  rol: 'Adjudicado' | 'Postulado';
  monto: number;
}

export interface Supplier {
  rut: string; // Chilean RUT (e.g., "76.452.120-3")
  razonSocial: string;
  nombreFantasia: string;
  estadoAcreditacion: 'Acreditado' | 'No Acreditado' | 'En Proceso';
  direccion: string;
  comuna: string;
  region: string;
  telefono: string;
  email: string;
  actividadEconomica: string;
  fechaRegistro: string;
  licitacionesHistoricas: HistoricalTender[];
}

export const proveedoresMock: Supplier[] = [
  {
    rut: "76.452.120-3",
    razonSocial: "Alimentos NutriChile S.A.",
    nombreFantasia: "NutriChile",
    estadoAcreditacion: "Acreditado",
    direccion: "Av. Américo Vespucio Sur 1420",
    comuna: "Pudahuel",
    region: "Metropolitana de Santiago",
    telefono: "+56 2 2840 5100",
    email: "licitaciones@nutrichile.cl",
    actividadEconomica: "Servicios de preparación y distribución de alimentos a granel y raciones alimenticias",
    fechaRegistro: "2018-03-12",
    licitacionesHistoricas: [
      {
        licitacionId: "3208-115-LE26",
        titulo: "Suministro de Raciones Alimenticias Escolares - Región de Valparaíso",
        organismo: "Junta Nacional de Auxilio Escolar y Becas (JUNAEB)",
        fecha: "2026-05-20",
        rol: "Adjudicado",
        monto: 835000000
      },
      {
        licitacionId: "1105-23-LP25",
        titulo: "Servicio de Catering para Eventos Institucionales 2025",
        organismo: "Ministerio de Relaciones Exteriores",
        fecha: "2025-11-14",
        rol: "Adjudicado",
        monto: 45000000
      },
      {
        licitacionId: "4412-89-LP25",
        titulo: "Adquisición de Vacunas y Jeringas para Campaña de Vacunación de Invierno",
        organismo: "Subsecretaría de Salud Pública",
        fecha: "2026-05-30",
        rol: "Postulado",
        monto: 310000000
      }
    ]
  },
  {
    rut: "96.874.000-8",
    razonSocial: "Seguridad y Vigilancia Segurimax Ltda.",
    nombreFantasia: "Segurimax",
    estadoAcreditacion: "Acreditado",
    direccion: "Calle La Concepción 151, Of. 402",
    comuna: "Providencia",
    region: "Metropolitana de Santiago",
    telefono: "+56 2 2341 9900",
    email: "contacto@segurimax.cl",
    actividadEconomica: "Servicios integrales de seguridad privada, control de accesos y vigilancia tecnológica",
    fechaRegistro: "2015-07-22",
    licitacionesHistoricas: [
      {
        licitacionId: "1250-8-LP26",
        titulo: "Servicio de Seguridad y Vigilancia para Edificios Municipales de Providencia",
        organismo: "Municipalidad de Providencia",
        fecha: "2026-05-28",
        rol: "Adjudicado",
        monto: 92400000
      },
      {
        licitacionId: "7820-22-LE26",
        titulo: "Suministro e Instalación de Luminarias LED Públicas Inteligentes",
        organismo: "Municipalidad de Concepción",
        fecha: "2026-04-05",
        rol: "Postulado",
        monto: 175000000
      }
    ]
  },
  {
    rut: "76.123.456-K",
    razonSocial: "Tecnologías de Información Alfa & Omega SpA",
    nombreFantasia: "Alfa & Omega Tech",
    estadoAcreditacion: "Acreditado",
    direccion: "Av. Nueva Providencia 1881, Piso 10",
    comuna: "Providencia",
    region: "Metropolitana de Santiago",
    telefono: "+56 2 2999 1234",
    email: "ventas@alfayomegatech.cl",
    actividadEconomica: "Consultoría informática, desarrollo de software a medida, arriendo y venta de hardware",
    fechaRegistro: "2020-10-05",
    licitacionesHistoricas: [
      {
        licitacionId: "5215-12-LP26",
        titulo: "Adquisición de Equipos Computacionales para Establecimientos Educacionales Públicos",
        organismo: "Ministerio de Educación (MINEDUC)",
        fecha: "2026-06-25",
        rol: "Postulado",
        monto: 118500000
      },
      {
        licitacionId: "2102-14-LP26",
        titulo: "Servicio de Consultoría y Desarrollo de Plataforma Web de Trámites Digitales",
        organismo: "Gobierno Regional de la Araucanía",
        fecha: "2026-07-02",
        rol: "Postulado",
        monto: 58000000
      }
    ]
  },
  {
    rut: "88.777.666-5",
    razonSocial: "Construcciones e Infraestructura del Sur S.A.",
    nombreFantasia: "ConSur",
    estadoAcreditacion: "En Proceso",
    direccion: "O'Higgins 450, Of. 82",
    comuna: "Concepción",
    region: "Biobío",
    telefono: "+56 41 2788 120",
    email: "licitaciones@consursa.cl",
    actividadEconomica: "Construcción de obras de ingeniería civil, caminos, puentes y defensas fluviales",
    fechaRegistro: "2021-02-18",
    licitacionesHistoricas: [
      {
        licitacionId: "1024-5-LR26",
        titulo: "Construcción y Mejoramiento de Defensas Fluviales Río Mapocho - Sector Pudahuel",
        organismo: "Dirección de Obras Hidráulicas - MOP",
        fecha: "2026-06-20",
        rol: "Postulado",
        monto: 442000000
      }
    ]
  },
  {
    rut: "77.888.999-4",
    razonSocial: "Importadora y Distribuidora GlobalMed SpA",
    nombreFantasia: "GlobalMed",
    estadoAcreditacion: "No Acreditado",
    direccion: "Av. Vitacura 5090",
    comuna: "Vitacura",
    region: "Metropolitana de Santiago",
    telefono: "+56 2 2450 6700",
    email: "contacto@globalmed.cl",
    actividadEconomica: "Distribución y venta al por mayor de dispositivos médicos, vacunas e insumos clínicos",
    fechaRegistro: "2024-01-15",
    licitacionesHistoricas: [
      {
        licitacionId: "4412-89-LP25",
        titulo: "Adquisición de Vacunas y Jeringas para Campaña de Vacunación de Invierno",
        organismo: "Subsecretaría de Salud Pública",
        fecha: "2026-05-30",
        rol: "Postulado",
        monto: 335000000
      }
    ]
  }
];
