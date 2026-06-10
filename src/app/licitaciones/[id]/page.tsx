import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLicitacionById } from '@/lib/mercadopublico';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LicitacionDetailPage({ params }: PageProps) {
  const { id } = await params;
  let tender = null;
  let errorMsg = null;

  try {
    tender = await getLicitacionById(id);
  } catch (err: unknown) {
    console.error('Error in LicitacionDetailPage:', err);
    errorMsg = 'El servidor de Mercado Público no se encuentra disponible. Por favor, intente más tarde.';
  }

  if (!tender && !errorMsg) {
    notFound();
  }

  const formatAmount = (amount: number, currency: string = 'CLP') => {
    if (currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    } else {
      return `${currency} ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatDuracion = (duracion?: string, unidad?: number) => {
    if (!duracion) return 'No especificado';
    const unidadStr = unidad === 1 ? 'días' : unidad === 2 ? 'meses' : unidad === 3 ? 'años' : '';
    return `${duracion} ${unidadStr}`;
  };

  const BADGE_MAP: Record<string, string> = {
    publicada: 'badge bg-info bg-opacity-25 text-info border border-info rounded-pill px-3 py-2',
    adjudicada: 'badge bg-success bg-opacity-25 text-success border border-success rounded-pill px-3 py-2',
    cerrada: 'badge bg-secondary bg-opacity-25 text-secondary border border-secondary rounded-pill px-3 py-2',
    desierta: 'badge bg-danger bg-opacity-25 text-danger border border-danger rounded-pill px-3 py-2',
    revocada: 'badge bg-warning bg-opacity-25 text-warning border border-warning rounded-pill px-3 py-2',
    suspendida: 'badge bg-secondary bg-opacity-25 text-secondary border border-secondary rounded-pill px-3 py-2',
  };

  const ICON_MAP: Record<string, string> = {
    publicada: 'bi-envelope-paper-fill',
    adjudicada: 'bi-check-circle-fill',
    cerrada: 'bi-lock-fill',
    desierta: 'bi-slash-circle',
    revocada: 'bi-x-circle-fill',
    suspendida: 'bi-pause-circle-fill',
  };

  const getBadge = (s: string) => BADGE_MAP[s.toLowerCase()] || 'badge bg-secondary text-light rounded-pill px-3 py-2';
  const getIcon  = (s: string) => ICON_MAP[s.toLowerCase()] || 'bi-circle';

  // Construct timeline from available dates
  const timelineEvents = tender ? [
    { label: 'Creación', date: tender.timeline?.fechaCreacion },
    { label: 'Publicación', date: tender.timeline?.fechaPublicacion },
    { label: 'Inicio Preguntas', date: tender.timeline?.fechaInicio },
    { label: 'Fin Preguntas', date: tender.timeline?.fechaFinal },
    { label: 'Respuesta Consultas', date: tender.timeline?.fechaPubRespuestas },
    { label: 'Visita Terreno', date: tender.timeline?.fechaVisitaTerreno },
    { label: 'Cierre Postulación', date: tender.timeline?.fechaCierre, highlight: true },
    { label: 'Apertura Técnica', date: tender.timeline?.fechaActoAperturaTecnica },
    { label: 'Apertura Económica', date: tender.timeline?.fechaActoAperturaEconomica },
    { label: 'Adjudicación Estimada', date: tender.timeline?.fechaEstimadaAdjudicacion },
    { label: 'Adjudicación Real', date: tender.timeline?.fechaAdjudicacion },
  ].filter(e => e.date) : [];

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100">
      <Navbar />

      <main className="page-content flex-grow-1">
        <div className="container-xl py-4">

          {/* Back */}
          <div className="mb-4">
            <Link href="/licitaciones" className="btn btn-outline-secondary btn-sm rounded-pill px-3" aria-label="Volver al listado de licitaciones">
              <i className="bi bi-arrow-left me-2" aria-hidden="true"></i> Volver al Listado
            </Link>
          </div>

          {errorMsg ? (
            <div className="alert border rounded-4 text-center py-5" style={{ background: 'rgba(251, 113, 133, 0.08)', borderColor: 'rgba(251, 113, 133, 0.25)' }} role="alert">
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <h4 className="fw-bolder mb-2" style={{ color: 'var(--rose)' }}>Error al cargar el detalle</h4>
              <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px' }}>{errorMsg}</p>
              <Link href={`/licitaciones/${id}`} className="btn btn-primary-custom px-4">
                <i className="bi bi-arrow-clockwise me-2"></i> Reintentar Carga
              </Link>
            </div>
          ) : tender ? (
            <>
              {/* Title Card */}
              <div className="card card-glass p-4 p-md-5 border-0 mb-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <span className={getBadge(tender.estado)}>
                    <i className={`bi ${getIcon(tender.estado)} me-2`} aria-hidden="true"></i>
                    {tender.estado}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-secondary border px-2 py-1">ID:</span>
                    <span className="fw-bold font-monospace fs-6">{tender.id}</span>
                  </div>
                </div>
                <h1 className="fw-black mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', letterSpacing: '-0.5px' }}>
                  {tender.titulo}
                </h1>
                <p className="text-secondary fs-6 mb-0" style={{ lineHeight: 1.6 }}>
                  {tender.descripcion}
                </p>
              </div>

              {/* Two-column Layout */}
              <div className="row g-4 mb-4">
                {/* Left: Info general */}
                <div className="col-lg-8">
                  <div className="card card-glass p-4 p-md-5 border-0 h-100">
                    <h4 className="fw-bolder mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                      <i className="bi bi-info-circle c-violet"></i> Información General
                    </h4>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Organismo Demandante</div>
                        <div className="fw-semibold text-dark mb-1">{tender.organismo}</div>
                        <div className="text-muted small">RUT: {tender.rutOrganismo}</div>
                        {tender.comprador?.nombreUnidad && (
                          <div className="small fw-semibold c-violet mt-1">Unidad: {tender.comprador.nombreUnidad}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Ubicación Organismo</div>
                        <div className="fw-semibold text-dark mb-1">{tender.comprador?.direccionUnidad || 'No especificada'}</div>
                        {(tender.comprador?.comunaUnidad || tender.comprador?.regionUnidad) && (
                          <div className="text-muted small">
                            {[tender.comprador.comunaUnidad, tender.comprador.regionUnidad].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Presupuesto Estimado</div>
                        <div className="fw-bold c-emerald mb-1">
                          {tender.visibilidadMonto === 0 ? (
                            <span className="text-muted"><i className="bi bi-eye-slash-fill me-2"></i>Monto reservado</span>
                          ) : tender.montoEstimado > 0 ? (
                            formatAmount(tender.montoEstimado, tender.moneda)
                          ) : (
                            'No publicado'
                          )}
                        </div>
                        <div className="text-muted small">
                          {tender.visibilidadMonto === 0 ? 'El monto no es visible públicamente' : `Moneda: ${tender.moneda} ${tender.tipoEstimacion === 2 ? '· Referencial' : tender.tipoEstimacion === 1 ? '· Fijo' : ''}`}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tipo de Licitación</div>
                        <div className="fw-semibold text-dark mb-1">{tender.tipoLicitacion || 'N/A'}</div>
                        <div className="text-muted small">Etapas: {tender.etapas ?? 1} etapa{tender.etapas === 2 ? 's' : ''}</div>
                      </div>

                      {tender.fuenteFinanciamiento && (
                        <div className="col-md-6">
                          <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Fuente de Financiamiento</div>
                          <div className="fw-semibold text-dark">{tender.fuenteFinanciamiento}</div>
                        </div>
                      )}

                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Duración del Contrato</div>
                        <div className="fw-semibold text-dark">{formatDuracion(tender.duracionContrato, tender.unidadTiempoDuracionContrato)}</div>
                      </div>
                    </div>

                    <hr className="my-5 text-secondary" style={{ opacity: 0.15 }} />

                    <h4 className="fw-bolder mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                      <i className="bi bi-person-lines-fill c-violet"></i> Contacto del Proceso
                    </h4>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Responsable</div>
                        <div className="fw-semibold text-dark mb-1">{tender.comprador?.nombreUsuario || tender.contactoNombre}</div>
                        {tender.comprador?.cargoUsuario && (
                          <div className="text-muted small">{tender.comprador.cargoUsuario}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Teléfono</div>
                        <div className="fw-semibold text-dark">{tender.contactoTelefono}</div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Correo Electrónico</div>
                        <a href={`mailto:${tender.contactoEmail}`} className="fw-bold c-violet text-decoration-none">{tender.contactoEmail}</a>
                      </div>
                      {tender.nombreResponsablePago && (
                        <div className="col-md-6">
                          <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Responsable de Pago</div>
                          <div className="fw-semibold text-dark">{tender.nombreResponsablePago}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Timeline */}
                <div className="col-lg-4">
                  <div className="card card-glass p-4 p-md-5 border-0 h-100">
                    <h4 className="fw-bolder mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                      <i className="bi bi-calendar-event c-violet"></i> Cronograma
                    </h4>

                    <div className="position-relative ms-2">
                      <div className="position-absolute top-0 bottom-0 start-0 border-start border-2" style={{ borderColor: 'var(--border-default)', transform: 'translateX(-1px)' }}></div>
                      {timelineEvents.map((event, idx) => (
                        <div key={idx} className="position-relative ps-4 mb-4">
                          <div className="position-absolute top-0 start-0 translate-middle p-1 rounded-circle bg-white border border-2" style={{ borderColor: event.highlight ? 'var(--amber)' : 'var(--violet-light)' }}></div>
                          <div className="text-muted fw-bold mb-1" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.label}</div>
                          <div className={`fw-semibold ${event.highlight ? 'c-amber' : 'text-dark'}`}>{formatDate(event.date)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Award Results */}
              {tender.estado === 'Adjudicada' && (
                <div className="card border border-success border-opacity-25 rounded-4 p-4 p-md-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(150, 210, 185, 0.18) 0%, rgba(160, 210, 225, 0.12) 100%)' }}>
                  <h4 className="fw-bolder mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                    <i className="bi bi-award-fill text-success"></i> Resolución de Adjudicación
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Proveedor Adjudicado</div>
                      {tender.proveedorAdjudicadoRUT ? (
                        <Link href={`/proveedores?search=${tender.proveedorAdjudicadoRUT}`} className="fw-bold text-dark text-decoration-none d-flex align-items-center gap-2 mb-1">
                          {tender.proveedorAdjudicadoNombre} <i className="bi bi-link-45deg c-violet"></i>
                        </Link>
                      ) : (
                        <div className="fw-semibold text-dark mb-1">{tender.proveedorAdjudicadoNombre || 'No especificado'}</div>
                      )}
                      {tender.proveedorAdjudicadoRUT && (
                        <div className="text-muted small">RUT: {tender.proveedorAdjudicadoRUT}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Monto Adjudicado</div>
                      <div className="fw-bold c-emerald mb-1">{tender.montoAdjudicado ? formatAmount(tender.montoAdjudicado, tender.moneda) : 'N/A'}</div>
                      <div className="text-muted small">Moneda: {tender.moneda}</div>
                    </div>
                    {(tender.adjudicacionFecha || tender.fechaAdjudicacion) && (
                      <div className="col-md-4">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Fecha Adjudicación</div>
                        <div className="fw-semibold text-dark mb-1">{formatDate(tender.adjudicacionFecha || tender.fechaAdjudicacion)}</div>
                        <div className="text-muted small">Publicación acta oficial</div>
                      </div>
                    )}
                    {tender.adjudicacionNumero && (
                      <div className="col-md-4">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Número de Resolución</div>
                        <div className="fw-semibold text-dark">{tender.adjudicacionNumero}</div>
                      </div>
                    )}
                    {tender.adjudicacionNumeroOferentes !== undefined && (
                      <div className="col-md-4">
                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Oferentes Recibidos</div>
                        <div className="fw-semibold text-dark">{tender.adjudicacionNumeroOferentes} oferentes</div>
                      </div>
                    )}
                    {tender.adjudicacionUrlActa && (
                      <div className="col-12 mt-4">
                        <a href={tender.adjudicacionUrlActa} target="_blank" rel="noopener noreferrer" className="fw-bold c-violet text-decoration-none d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-pdf"></i> Ver Acta Oficial en Mercado Público <i className="bi bi-box-arrow-up-right small"></i>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="card card-glass p-4 p-md-5 border-0">
                <h4 className="fw-bolder mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.2rem' }}>
                  <i className="bi bi-list-check c-violet"></i> Ítems / Productos Solicitados
                  <span className="badge bg-light text-secondary border ms-2 rounded-pill">{tender.items.length} ítems</span>
                </h4>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
                    <thead>
                      <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-default)' }}>
                        <th className="py-3 px-3 border-0">Ref.</th>
                        <th className="py-3 px-3 border-0 w-25">Producto / Servicio</th>
                        <th className="py-3 px-3 border-0 w-50">Descripción Técnica</th>
                        <th className="py-3 px-3 border-0 text-end">Cantidad</th>
                        <th className="py-3 px-3 border-0">Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tender.items.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td className="px-3 py-3 border-0">
                            <span className="badge bg-light text-secondary border">{String(index + 1).padStart(2, '0')}</span>
                          </td>
                          <td className="px-3 py-3 border-0">
                            <div className="fw-bold text-dark">{item.nombre}</div>
                            {item.codigoProducto && <div className="text-muted small mt-1">ONU: {item.codigoProducto}</div>}
                            {item.categoriaProducto && <div className="c-violet small mt-1 fw-semibold">Cat: {item.categoriaProducto}</div>}
                          </td>
                          <td className="px-3 py-3 border-0 text-secondary" style={{ fontSize: '0.9rem' }}>{item.descripcion}</td>
                          <td className="px-3 py-3 border-0 text-end fw-bold font-monospace">{item.cantidad.toLocaleString('es-CL')}</td>
                          <td className="px-3 py-3 border-0 text-secondary">{item.unidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

        </div>
      </main>

      <Footer />
    </div>
  );
}
