'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface HistoricalTender {
  licitacionId: string;
  titulo: string;
  organismo: string;
  fecha: string;
  rol: 'Adjudicado' | 'Postulado';
  monto: number;
}

interface Supplier {
  rut: string;
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

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDv = 11 - (sum % 11);
  let computedDv = '0';
  if (expectedDv === 10) computedDv = 'K';
  else if (expectedDv === 11) computedDv = '0';
  else computedDv = expectedDv.toString();
  return computedDv === dv;
}

function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const dv = clean.slice(-1);
  let body = clean.slice(0, -1);
  let formattedBody = '';
  while (body.length > 3) {
    formattedBody = '.' + body.slice(-3) + formattedBody;
    body = body.slice(0, -3);
  }
  formattedBody = body + formattedBody;
  return `${formattedBody}-${dv}`;
}

function ProveedoresSearchContent() {
  const searchParams = useSearchParams();

  const [rutInput, setRutInput] = useState('');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (targetRut: string) => {
    const cleanedRut = targetRut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (!cleanedRut) { 
      setErrorMsg('Por favor ingrese un RUT.'); 
      setSupplier(null); 
      setSearched(false); 
      return; 
    }
    if (!validateRut(cleanedRut)) {
      setErrorMsg('El RUT ingresado no es válido. Verifique el dígito verificador.');
      setSupplier(null); 
      setSearched(false); 
      return;
    }
    setErrorMsg(''); 
    setLoading(true); 
    setSupplier(null); 
    setSearched(true);
    try {
      const res = await fetch(`/api/proveedores?rut=${encodeURIComponent(cleanedRut)}`);
      if (res.ok) {
        setSupplier(await res.json());
      } else {
        setSupplier(null);
        if (res.status !== 404) {
          const errData = await res.json().catch(() => ({}));
          setErrorMsg(errData.error || 'Error al consultar el proveedor.');
        }
      }
    } catch {
      setErrorMsg('Error al consultar. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch) {
      const formatted = formatRut(querySearch);
      Promise.resolve().then(() => {
        setRutInput(formatted);
        handleSearch(querySearch);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = `/proveedores?search=${encodeURIComponent(rutInput)}`;
    window.history.pushState(null, '', newUrl);
    handleSearch(rutInput);
  };

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getAccreditationClass = (status: string) => {
    if (status === 'Acreditado') return 'badge bg-success bg-opacity-25 text-success border border-success rounded-pill px-3 py-2';
    if (status === 'En Proceso') return 'badge bg-warning bg-opacity-25 text-warning border border-warning rounded-pill px-3 py-2';
    return 'badge bg-danger bg-opacity-25 text-danger border border-danger rounded-pill px-3 py-2';
  };

  const getAccreditationIcon = (status: string) => {
    if (status === 'Acreditado') return 'bi-check-circle-fill';
    if (status === 'En Proceso') return 'bi-clock-history';
    return 'bi-x-circle-fill';
  };

  return (
    <>
      {/* Search Hero Panel */}
      <div className="card card-glass p-4 p-md-5 border-0 mb-5">
        <div className="mb-4">
          <div className="badge bg-light text-secondary border px-2 py-1 mb-3">
            <i className="bi bi-fingerprint me-1" aria-hidden="true"></i> Validación RUT · Módulo 11
          </div>
          <h2 className="fw-bolder fs-4 mb-2" style={{ letterSpacing: '-0.4px' }}>Formulario de Consulta</h2>
          <p className="text-secondary mb-0">Ingrese el RUT de la empresa para ver su perfil en ChileProveedores y su historial licitatorio.</p>
        </div>

        <form onSubmit={onFormSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8 col-lg-6">
              <label className="form-label text-muted text-uppercase fw-semibold" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }} htmlFor="rutInput">RUT del Proveedor</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted border-end-0"><i className="bi bi-credit-card-2-front"></i></span>
                <input
                  id="rutInput"
                  type="text"
                  className="form-control border-start-0 ps-0 shadow-none py-2"
                  placeholder="76.123.456-K o 76123456K"
                  value={rutInput}
                  onChange={(e) => setRutInput(e.target.value)}
                  aria-required="true"
                />
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-3">
              <button type="submit" className="btn btn-primary-custom w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                <i className="bi bi-search"></i> Consultar Proveedor
              </button>
            </div>
          </div>
        </form>

        {errorMsg && (
          <div className="alert border rounded-3 mt-4 mb-0 d-flex align-items-center gap-3" style={{ background: 'rgba(251, 113, 133, 0.08)', borderColor: 'rgba(251, 113, 133, 0.25)', color: 'var(--rose)' }} role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i> {errorMsg}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Validando RUT y consultando base de datos...</p>
        </div>
      ) : searched ? (
        supplier ? (
          <div className="row g-4">
            {/* Supplier Card */}
            <div className="col-lg-5">
              <div className="card card-glass p-4 border-0 h-100">
                <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                  <span className={getAccreditationClass(supplier.estadoAcreditacion)}>
                    <i className={`bi ${getAccreditationIcon(supplier.estadoAcreditacion)} me-2`}></i>
                    Estado: {supplier.estadoAcreditacion}
                  </span>
                  <span className="fw-bold text-muted font-monospace">{formatRut(supplier.rut)}</span>
                </div>

                <h2 className="fw-black fs-3 mb-1" style={{ letterSpacing: '-0.4px' }}>{supplier.razonSocial}</h2>
                <p className="c-violet fw-bold mb-4">{supplier.nombreFantasia}</p>

                <div className="mb-3">
                  <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Giro / Actividad Económica</div>
                  <div className="fw-semibold text-dark">{supplier.actividadEconomica}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Dirección Corporativa</div>
                  <div className="fw-semibold text-dark">{supplier.direccion}, {supplier.comuna}, {supplier.region}</div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Teléfono</div>
                    <div className="fw-semibold text-dark">{supplier.telefono}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Registro ChileProveedores</div>
                    <div className="fw-semibold text-dark">{formatDate(supplier.fechaRegistro)}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Correo Electrónico</div>
                  <a href={`mailto:${supplier.email}`} className="fw-bold c-violet text-decoration-none">{supplier.email}</a>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="col-lg-7">
              <div className="card card-glass p-4 border-0 h-100">
                <h4 className="fw-bolder fs-5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-journal-text c-violet"></i> 
                  <span className="text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.8px' }}>Historial Licitatorio Reciente</span>
                  {supplier.licitacionesHistoricas.length > 0 && (
                    <span className="badge bg-light text-secondary border rounded-pill ms-2">{supplier.licitacionesHistoricas.length} registros</span>
                  )}
                </h4>

                {supplier.licitacionesHistoricas.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-default)' }}>
                          <th className="py-3 px-3 border-0">Licitación</th>
                          <th className="py-3 px-3 border-0">Rol</th>
                          <th className="py-3 px-3 border-0 text-end">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.licitacionesHistoricas.map((hist) => (
                          <tr key={hist.licitacionId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="px-3 py-3 border-0">
                              <Link href={`/licitaciones/${hist.licitacionId}`} className="fw-bold text-dark text-decoration-none d-block mb-1" style={{ fontSize: '0.9rem' }}>
                                {hist.titulo}
                              </Link>
                              <span className="text-muted small d-block font-monospace">{hist.licitacionId} · <span className="font-sans-serif">{hist.organismo}</span></span>
                            </td>
                            <td className="px-3 py-3 border-0">
                              <span className={`badge rounded-pill px-2 py-1 border ${hist.rol === 'Adjudicado' ? 'bg-success bg-opacity-25 text-success border-success' : 'bg-info bg-opacity-25 text-info border-info'}`} style={{ fontSize: '0.7rem' }}>
                                {hist.rol}
                              </span>
                            </td>
                            <td className="px-3 py-3 border-0 text-end fw-bold font-monospace c-emerald">{formatCLP(hist.monto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-slash-circle mb-3" style={{ fontSize: '2.5rem' }}></i>
                    <p className="mb-0">Sin historial licitatorio registrado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-glass p-5 border-0 text-center">
            <div className="fs-1 mb-3" aria-hidden="true">⚠️</div>
            <h4 className="fw-bolder mb-3">Proveedor sin historial</h4>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
              El RUT <strong className="text-dark">{rutInput}</strong> es válido matemáticamente, pero no registra actividad licitatoria ni acreditación vigente en la base de datos de ChileProveedores.
            </p>
          </div>
        )
      ) : (
        <div className="card bg-transparent border-2 border-dashed p-5 text-center text-muted" style={{ borderColor: 'var(--border-default)' }}>
          <div className="fs-1 mb-3 opacity-50"><i className="bi bi-fingerprint"></i></div>
          <h4 className="fw-bolder mb-2 text-dark">Consulta de Acreditación</h4>
          <p className="mx-auto mb-0" style={{ maxWidth: '500px' }}>
            Ingrese el RUT comercial de la empresa para ver su perfil en ChileProveedores y las licitaciones en las que ha participado.
          </p>
        </div>
      )}
    </>
  );
}

function SearchFallback() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}

export default function ProveedoresPage() {
  return (
    <div className="page-wrapper d-flex flex-column min-vh-100">
      <Navbar />

      <main className="page-content flex-grow-1">
        <div className="container-xl py-5">
          <div className="mb-4">
            <div className="badge bg-light text-secondary border px-2 py-1 mb-2">
              <i className="bi bi-person-badge me-1"></i> Proveedores
            </div>
            <h1 className="fw-bolder fs-2 mb-1">Buscador de Proveedores</h1>
            <p className="text-secondary mb-0">Verifica la acreditación y experiencia de contratistas del Estado por RUT.</p>
          </div>

          <Suspense fallback={<SearchFallback />}>
            <ProveedoresSearchContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
