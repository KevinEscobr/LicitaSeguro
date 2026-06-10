import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-5 mt-5 border-top" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="container-xl">
        <div className="row g-4">
          <div className="col-lg-5">
            <Link href="/" className="text-decoration-none d-flex align-items-center gap-2 mb-3">
              <span className="nav-brand-icon">
                <i className="bi bi-shield-check"></i>
              </span>
              <span className="fw-bolder fs-5 text-dark" style={{ letterSpacing: '-0.4px' }}>
                Licita<span className="c-violet">Seguro</span>
              </span>
            </Link>
            <p className="text-muted small pe-lg-5">
              Plataforma de inteligencia para el monitoreo y análisis de las licitaciones públicas del Estado de Chile, integrada directamente con la API de Mercado Público.
            </p>
          </div>

          <div className="col-sm-6 col-lg-3 offset-lg-1">
            <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Módulos</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link href="/" className="text-decoration-none text-secondary">Inicio</Link></li>
              <li><Link href="/licitaciones" className="text-decoration-none text-secondary">Portal de Licitaciones</Link></li>
              <li><Link href="/proveedores" className="text-decoration-none text-secondary">Búsqueda por RUT</Link></li>
            </ul>
          </div>

          <div className="col-sm-6 col-lg-3">
            <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Fuentes Oficiales</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <a href="https://www.mercadopublico.cl" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary">
                  Mercado Público <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.72rem' }}></i>
                </a>
              </li>
              <li>
                <a href="https://api.mercadopublico.cl" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary">
                  API ChileCompra <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.72rem' }}></i>
                </a>
              </li>
              <li>
                <a href="https://www.chileproveedores.cl" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-secondary">
                  ChileProveedores <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.72rem' }}></i>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 text-secondary" style={{ opacity: 0.15 }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
          <span className="mb-2 mb-md-0">© {new Date().getFullYear()} LicitaSeguro. Todos los derechos reservados.</span>
          <span>Construido con Next.js 16 · Datos: Mercado Público Chile</span>
        </div>
      </div>
    </footer>
  );
}
