import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Hero */}
        <section className="py-5 bg-grid position-relative" aria-label="Introducción y estadísticas rápidas de LicitaSeguro">
          <div className="container-xl text-center pt-5 pb-4">
            <div>
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-4" style={{ background: 'rgba(184, 172, 238, 0.18)', border: '1px solid rgba(184, 172, 238, 0.4)', color: 'var(--violet)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                <span className="rounded-circle" style={{ width: '6px', height: '6px', background: '#b8acee' }} aria-hidden="true"></span>
                Datos en tiempo real · API Mercado Público
              </div>
            </div>

            <h1 className="fw-bolder mb-3" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', letterSpacing: '-2px', lineHeight: 1.1 }}>
              Inteligencia para<br />
              <span className="gradient-text">Licitaciones Públicas</span>
            </h1>

            <p className="text-secondary mx-auto mb-5" style={{ maxWidth: '560px', fontSize: '1.1rem', lineHeight: 1.7 }}>
              Consulta, filtra y analiza las convocatorias de ChileCompra en tiempo real.
              Verifica el estado comercial de proveedores por RUT directamente.
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-3">
              <Link href="/licitaciones" className="btn btn-primary-custom px-4 py-3 rounded-3" aria-label="Explorar Licitaciones de Mercado Público">
                <i className="bi bi-search me-2" aria-hidden="true"></i>
                Explorar Licitaciones
              </Link>
              <Link href="/proveedores" className="btn btn-outline-custom px-4 py-3 rounded-3" aria-label="Buscar e inspeccionar proveedores por RUT">
                <i className="bi bi-person-badge me-2" aria-hidden="true"></i>
                Buscar Proveedor
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container-xl py-5" aria-label="Estadísticas de la plataforma">
          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="card card-glass h-100 border-0 p-4">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-violet-dim c-violet mx-auto mb-3" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
                  <i className="bi bi-activity" aria-hidden="true"></i>
                </div>
                <div className="fw-black mb-1" style={{ fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>12.450</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Licitaciones Activas</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-glass h-100 border-0 p-4">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-emerald-dim c-emerald mx-auto mb-3" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
                  <i className="bi bi-cash-stack" aria-hidden="true"></i>
                </div>
                <div className="fw-black mb-1" style={{ fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>$45M</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Monto Transado</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-glass h-100 border-0 p-4">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-cyan-dim c-cyan mx-auto mb-3" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
                  <i className="bi bi-people-fill" aria-hidden="true"></i>
                </div>
                <div className="fw-black mb-1" style={{ fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>1.248</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Proveedores</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card card-glass h-100 border-0 p-4">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-amber-dim c-amber mx-auto mb-3" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>
                  <i className="bi bi-lightning-charge-fill" aria-hidden="true"></i>
                </div>
                <div className="fw-black mb-1" style={{ fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>Rápido</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Tiempo Respuesta ≈2s</div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container-xl py-5" aria-labelledby="features-section-title">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill mb-3">
              <i className="bi bi-grid-3x3-gap me-2" aria-hidden="true"></i>
              Módulos
            </span>
            <h2 id="features-section-title" className="fw-black mx-auto" style={{ fontSize: '1.8rem', letterSpacing: '-0.8px', maxWidth: '480px' }}>
              Todo lo que necesitas en un solo lugar
            </h2>
          </div>

          <div className="row g-4 mb-5">
            {/* Portal de Licitaciones */}
            <div className="col-md-6">
              <div className="card card-glass h-100 p-4 border-0">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-violet-dim c-violet" style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}>
                    <i className="bi bi-briefcase-fill" aria-hidden="true"></i>
                  </div>
                  <span className="badge bg-light text-secondary border px-2 py-1">Portal</span>
                </div>
                <h3 className="fw-bolder fs-4 mb-3" style={{ letterSpacing: '-0.5px' }}>Portal de Licitaciones</h3>
                <p className="text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Navega por la cartelera completa de licitaciones públicas del Estado de Chile. Filtra en tiempo real por fecha, estado administrativo y organismo, con datos directos de ChileCompra.
                </p>
                <div className="d-flex align-items-center gap-3">
                  <Link href="/licitaciones" className="btn btn-primary-custom px-3 py-2" style={{ fontSize: '0.85rem' }} aria-label="Ir al portal de licitaciones públicas">
                    Ir al Portal <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i>
                  </Link>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>Datos en vivo</span>
                </div>
              </div>
            </div>

            {/* Buscador de Proveedores */}
            <div className="col-md-6">
              <div className="card card-glass h-100 p-4 border-0">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-cyan-dim c-cyan" style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}>
                    <i className="bi bi-person-badge-fill" aria-hidden="true"></i>
                  </div>
                  <span className="badge bg-light text-secondary border px-2 py-1">Verificación</span>
                </div>
                <h3 className="fw-bolder fs-4 mb-3" style={{ letterSpacing: '-0.5px' }}>Buscador de Proveedores</h3>
                <p className="text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Verifica el estado de acreditación de empresas y personas jurídicas. Busca por RUT chileno para consultar su perfil en ChileProveedores e historial de adjudicaciones.
                </p>
                <div className="d-flex align-items-center gap-3">
                  <Link href="/proveedores" className="btn btn-outline-custom px-3 py-2" style={{ fontSize: '0.85rem' }} aria-label="Buscar proveedor por RUT">
                    Buscar por RUT <i className="bi bi-search ms-1" aria-hidden="true"></i>
                  </Link>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>Validación Módulo 11</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="container-xl py-5 mb-4" aria-labelledby="why-us-title">
          <hr className="mb-5 text-secondary" style={{ opacity: 0.15 }} />
          <div className="text-center mb-5">
            <h2 id="why-us-title" className="fw-bolder" style={{ fontSize: '1.4rem', letterSpacing: '-0.6px' }}>
              ¿Por qué LicitaSeguro?
            </h2>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex gap-3 align-items-start">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-violet-dim c-violet flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                  <i className="bi bi-patch-check-fill" aria-hidden="true"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>Datos Certificados</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Toda la información proviene directamente de la API oficial de ChileCompra, garantizando datos siempre actualizados y confiables.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-3 align-items-start">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-cyan-dim c-cyan flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                  <i className="bi bi-funnel-fill" aria-hidden="true"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>Filtros Avanzados</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Filtra por estado de licitación, rango de fechas o busca por texto libre en ID, título e institución con respuesta instantánea.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-3 align-items-start">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center bg-emerald-dim c-emerald flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                  <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>Historial Licitatorio</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Analiza la trayectoria de los proveedores mediante su historial de adjudicaciones y postulaciones en procesos de compra pública.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
