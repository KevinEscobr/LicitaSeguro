'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tender } from '@/data/licitacionesMock';

const ESTADOS = ['Todos', 'Publicada', 'Cerrada', 'Adjudicada', 'Desierta', 'Revocada', 'Suspendida'];

const BADGE_MAP: Record<string, string> = {
  publicada: 'badge rounded-pill bg-info bg-opacity-25 text-info border border-info px-3 py-2',
  adjudicada: 'badge rounded-pill bg-success bg-opacity-25 text-success border border-success px-3 py-2',
  cerrada: 'badge rounded-pill bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-2',
  desierta: 'badge rounded-pill bg-danger bg-opacity-25 text-danger border border-danger px-3 py-2',
  revocada: 'badge rounded-pill bg-warning bg-opacity-25 text-warning border border-warning px-3 py-2',
  suspendida: 'badge rounded-pill bg-secondary bg-opacity-25 text-secondary border border-secondary px-3 py-2',
};

const ICON_MAP: Record<string, string> = {
  publicada: 'bi-envelope-paper-fill',
  adjudicada: 'bi-check-circle-fill',
  cerrada: 'bi-lock-fill',
  desierta: 'bi-slash-circle',
  revocada: 'bi-x-circle-fill',
  suspendida: 'bi-pause-circle-fill',
};

export default function LicitacionesPage() {
  const [licitaciones, setLicitaciones] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetry, setIsRetry] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [detailsCache, setDetailsCache] = useState<Record<string, Tender>>({});
  const [fetchingIds, setFetchingIds] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const res = await fetch('/api/licitaciones');
        if (res.ok) {
          const data = await res.json();
          setLicitaciones(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'El servidor de Mercado Público no se encuentra disponible.');
        }
      } catch (err) {
        console.error('Error fetching tenders:', err);
        setError('Error de conexión. Verifique su red e intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isRetry]);

  const filtered = useMemo(() => {
    let result = [...licitaciones];
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(term) ||
          t.titulo.toLowerCase().includes(term) ||
          t.organismo.toLowerCase().includes(term) ||
          t.descripcion.toLowerCase().includes(term)
      );
    }
    if (estado !== 'Todos') {
      result = result.filter((t) => t.estado.toLowerCase() === estado.toLowerCase());
    }
    if (fechaInicio) result = result.filter((t) => t.fechaPublicacion >= fechaInicio);
    if (fechaFin)   result = result.filter((t) => t.fechaPublicacion <= fechaFin);
    return result;
  }, [licitaciones, search, estado, fechaInicio, fechaFin]);

  // Paginated items
  const paginatedTenders = useMemo(() => {
    const start = (currentPage - 1) * 9;
    return filtered.slice(start, start + 9);
  }, [filtered, currentPage]);

  const pageIdsStr = useMemo(() => paginatedTenders.map(t => t.id).join(','), [paginatedTenders]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / 9), [filtered]);

  // Fetch details of page items in parallel
  useEffect(() => {
    if (paginatedTenders.length === 0) return;

    const idsToFetch = paginatedTenders
      .map(t => t.id)
      .filter(id => !detailsCache[id] && !fetchingIds[id]);

    if (idsToFetch.length === 0) return;

    Promise.resolve().then(() => {
      setFetchingIds(prev => {
        const next = { ...prev };
        idsToFetch.forEach(id => { next[id] = true; });
        return next;
      });
    });

    idsToFetch.forEach(async (id) => {
      try {
        const res = await fetch(`/api/licitaciones/${id}`);
        if (res.ok) {
          const detail = await res.json();
          setDetailsCache(prev => ({ ...prev, [id]: detail }));
        } else {
          const summaryTender = paginatedTenders.find(t => t.id === id);
          if (summaryTender) {
            setDetailsCache(prev => ({
              ...prev,
              [id]: {
                ...summaryTender,
                organismo: summaryTender.organismo || 'Organismo Público',
                descripcion: summaryTender.descripcion || summaryTender.titulo
              }
            }));
          }
        }
      } catch (err) {
        console.error(`Error fetching detail for tender ${id}:`, err);
        const summaryTender = paginatedTenders.find(t => t.id === id);
        if (summaryTender) {
          setDetailsCache(prev => ({
            ...prev,
            [id]: {
              ...summaryTender,
              organismo: summaryTender.organismo || 'Organismo Público',
              descripcion: summaryTender.descripcion || summaryTender.titulo
            }
          }));
        }
      } finally {
        setFetchingIds(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdsStr]);

  const handleReset = () => {
    setSearch('');
    setEstado('Todos');
    setFechaInicio('');
    setFechaFin('');
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setIsRetry(prev => prev + 1);
  };

  const formatAmount = (amount: number, currency: string = 'CLP') => {
    if (currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    } else {
      return `${currency} ${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getBadge = (s: string) => BADGE_MAP[s.toLowerCase()] || 'badge rounded-pill bg-secondary text-light px-3 py-2';
  const getIcon  = (s: string) => ICON_MAP[s.toLowerCase()] || 'bi-circle';

  const activeFilters = [search, estado !== 'Todos' ? estado : '', fechaInicio, fechaFin].filter(Boolean).length;

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100">
      <Navbar />

      <main className="page-content flex-grow-1">
        <div className="container-xl py-5">
          {/* Header */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-light text-secondary border px-2 py-1"><i className="bi bi-briefcase me-1" aria-hidden="true"></i> Portal</span>
              {activeFilters > 0 && (
                <span className="badge px-2 py-1" style={{ color: 'var(--violet-light)', borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)', border: '1px solid' }}>
                  {activeFilters} filtro{activeFilters > 1 ? 's' : ''} activo{activeFilters > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="fw-bolder fs-2 mb-1">Portal de Licitaciones</h1>
            <p className="text-secondary mb-0">Convocatorias públicas vigentes de Mercado Público · Chile</p>
          </div>

          {/* Filters */}
          <div className="card card-glass p-4 border-0 mb-4">
            <h6 className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', letterSpacing: '0.8px' }}>
              <i className="bi bi-sliders c-violet" aria-hidden="true"></i> Filtros de búsqueda
            </h6>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-lg-4">
                <label className="form-label text-muted text-uppercase fw-semibold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }} htmlFor="search-input">Buscar</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                  <input
                    id="search-input"
                    type="text"
                    className="form-control border-start-0 ps-0 shadow-none"
                    placeholder="ID, título o institución..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
              <div className="col-6 col-md-4 col-lg-2">
                <label className="form-label text-muted text-uppercase fw-semibold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }} htmlFor="estado-select">Estado</label>
                <select
                  id="estado-select"
                  className="form-select shadow-none"
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setCurrentPage(1); }}
                  style={{ cursor: 'pointer' }}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e === 'Todos' ? 'Todos los estados' : e}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-4 col-lg-2">
                <label className="form-label text-muted text-uppercase fw-semibold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }} htmlFor="fecha-inicio-input">Fecha desde</label>
                <input id="fecha-inicio-input" type="date" className="form-control shadow-none" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="col-6 col-md-4 col-lg-2">
                <label className="form-label text-muted text-uppercase fw-semibold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }} htmlFor="fecha-fin-input">Fecha hasta</label>
                <input id="fecha-fin-input" type="date" className="form-control shadow-none" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="col-6 col-md-12 col-lg-2">
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleReset}
                  aria-label="Limpiar todos los filtros de búsqueda"
                >
                  <i className="bi bi-x-circle" aria-hidden="true"></i> Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Results bar */}
          {!error && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="text-secondary">
                {loading ? 'Cargando...' : (
                  <>Se encontraron <strong className="text-dark">{filtered.length}</strong> licitaciones</>
                )}
              </div>
              {!loading && filtered.length > 0 && (
                <span className="badge bg-light text-secondary border px-2 py-1"><i className="bi bi-arrow-down-up me-1" aria-hidden="true"></i> Más recientes primero</span>
              )}
            </div>
          )}

          {/* Grid or Error/Empty state */}
          {error ? (
            <div className="alert border rounded-4 text-center py-5" style={{ background: 'rgba(251, 113, 133, 0.08)', borderColor: 'rgba(251, 113, 133, 0.25)' }} role="alert" aria-live="assertive">
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <h4 className="fw-bolder mb-2" style={{ color: 'var(--rose)' }}>Error al cargar licitaciones</h4>
              <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px', fontSize: '0.9rem' }}>{error}</p>
              <button className="btn btn-primary-custom px-4" onClick={handleRetry} aria-label="Reintentar la consulta de licitaciones">
                <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i> Reintentar Carga
              </button>
            </div>
          ) : loading ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {[1,2,3,4,5,6].map((n) => (
                <div key={n} className="col">
                  <div className="card card-glass h-100 p-4 border-0 d-flex flex-column">
                    <div className="d-flex justify-content-between mb-3">
                      <div className="placeholder-glow w-25"><span className="placeholder col-12 rounded"></span></div>
                      <div className="placeholder-glow w-25"><span className="placeholder col-12 rounded"></span></div>
                    </div>
                    <div className="placeholder-glow mb-2"><span className="placeholder col-10 rounded"></span></div>
                    <div className="placeholder-glow mb-4"><span className="placeholder col-8 rounded"></span></div>
                    <div className="placeholder-glow mt-auto"><span className="placeholder col-12 rounded py-3"></span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {paginatedTenders.map((t, i) => {
                  const tenderData = detailsCache[t.id] || t;
                  const isDetailLoading = !detailsCache[t.id];

                  return (
                    <div key={t.id} className="col">
                      <div className="card card-glass h-100 p-4 border-0 d-flex flex-column">
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                          <span className={getBadge(t.estado)} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            <i className={`bi ${getIcon(t.estado)} me-1`} aria-hidden="true"></i>
                            {t.estado}
                          </span>
                          {!isDetailLoading && tenderData.tipoLicitacion && (
                            <span className="badge px-2 py-1" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--violet-light)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.7rem' }}>
                              {tenderData.tipoLicitacion}
                            </span>
                          )}
                          <span className="ms-auto text-muted small fw-semibold font-monospace">{t.id}</span>
                        </div>

                        <h5 className="fw-bolder mb-2" style={{ fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{t.titulo}</h5>
                        <div className="text-secondary small fw-medium mb-3 d-flex align-items-center">
                          <i className="bi bi-building me-2" aria-hidden="true"></i>
                          {isDetailLoading ? (
                            <div className="placeholder-glow flex-grow-1"><span className="placeholder col-8 rounded"></span></div>
                          ) : (
                            tenderData.organismo
                          )}
                        </div>
                        <div className="text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {isDetailLoading ? (
                            <div className="placeholder-glow w-100">
                              <span className="placeholder col-12 rounded mb-1"></span>
                              <span className="placeholder col-10 rounded"></span>
                            </div>
                          ) : (
                            tenderData.descripcion
                          )}
                        </div>

                        <div className="mt-auto pt-3 border-top border-light">
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Presupuesto Estimado</div>
                              {isDetailLoading ? (
                                <div className="placeholder-glow mt-1"><span className="placeholder col-6 rounded"></span></div>
                              ) : (
                                <div className="fw-bold c-emerald mt-1">
                                  {tenderData.visibilidadMonto === 0 ? (
                                    <span className="text-muted small">Monto reservado</span>
                                  ) : tenderData.montoEstimado > 0 ? (
                                    formatAmount(tenderData.montoEstimado, tenderData.moneda)
                                  ) : (
                                    'No publicado'
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Cierre</div>
                              <div className="fw-semibold text-dark mt-1 d-flex flex-column align-items-end">
                                {formatDate(t.fechaCierre)}
                                {!isDetailLoading && tenderData.diasCierre !== undefined && tenderData.diasCierre > 0 && (
                                  <span className="badge bg-warning bg-opacity-25 text-warning px-1 py-0 mt-1">{tenderData.diasCierre}d restantes</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Link href={`/licitaciones/${t.id}`} className="btn btn-primary-custom w-100 py-2 d-flex justify-content-between align-items-center" aria-label={`Ver Ficha Técnica de la licitación con ID ${t.id}`}>
                            Ver Ficha Técnica <i className="bi bi-chevron-right" aria-hidden="true"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className="d-flex justify-content-center align-items-center gap-2 mt-5" aria-label="Controles de paginación">
                  <button className="btn btn-outline-secondary px-3" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Ir a la página anterior">
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) { pages.push(i); }
                    } else {
                      pages.push(1);
                      let start = Math.max(2, currentPage - 1);
                      let end = Math.min(totalPages - 1, currentPage + 1);

                      if (currentPage <= 3) end = 4;
                      if (currentPage >= totalPages - 2) start = totalPages - 3;

                      if (start > 2) pages.push('...');
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (end < totalPages - 1) pages.push('...');
                      pages.push(totalPages);
                    }
                    
                    return pages.map((p, idx) => (
                      p === '...' ? (
                        <span key={`ell-${idx}`} className="px-2 text-muted">...</span>
                      ) : (
                        <button key={`page-${p}`} className={`btn ${currentPage === p ? 'btn-primary-custom' : 'btn-outline-secondary'} px-3`} onClick={() => setCurrentPage(Number(p))} aria-label={`Ir a la página ${p}`}>
                          {p}
                        </button>
                      )
                    ));
                  })()}

                  <button className="btn btn-outline-secondary px-3" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Ir a la página siguiente">
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="card card-glass border-0 text-center py-5">
              <div className="fs-1 mb-3" aria-hidden="true">🔍</div>
              {licitaciones.length === 0 ? (
                <>
                  <h4 className="fw-bolder mb-3">Sin licitaciones disponibles</h4>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
                    La consulta a Mercado Público no retornó convocatorias activas. Esto puede deberse a que no se registran procesos para las fechas especificadas o a fallas temporales en la fuente oficial.
                  </p>
                  <button className="btn btn-primary-custom px-4" onClick={handleRetry} aria-label="Reintentar consultar el servidor">
                    <i className="bi bi-arrow-clockwise me-2" aria-hidden="true"></i> Reintentar Carga
                  </button>
                </>
              ) : (
                <>
                  <h4 className="fw-bolder mb-3">Sin resultados de búsqueda</h4>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
                    No encontramos licitaciones con los criterios aplicados. Intenta ajustar o limpiar los filtros de búsqueda para ver otras convocatorias.
                  </p>
                  <button className="btn btn-outline-custom px-4" onClick={handleReset} aria-label="Limpiar todos los filtros aplicados">
                    Restablecer Filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
