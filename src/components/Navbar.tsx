'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top border-bottom py-3" style={{ background: 'rgba(240, 242, 248, 0.88)', backdropFilter: 'blur(20px)' }}>
      <div className="container-xl">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2 fw-bolder fs-5 text-dark" style={{ letterSpacing: '-0.5px' }}>
          <span className="nav-brand-icon">
            <i className="bi bi-shield-check"></i>
          </span>
          <span>Licita<span className="c-violet">Seguro</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileOpen ? 'show' : ''}`} id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link href="/" className={`nav-link px-3 rounded-3 ${isActive('/') ? 'active bg-violet-dim c-violet fw-semibold' : ''}`} onClick={() => setMobileOpen(false)}>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/licitaciones" className={`nav-link px-3 rounded-3 mx-lg-1 ${isActive('/licitaciones') ? 'active bg-violet-dim c-violet fw-semibold' : ''}`} onClick={() => setMobileOpen(false)}>
                Licitaciones
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/proveedores" className={`nav-link px-3 rounded-3 mx-lg-1 ${isActive('/proveedores') ? 'active bg-violet-dim c-violet fw-semibold' : ''}`} onClick={() => setMobileOpen(false)}>
                Proveedores
              </Link>
            </li>
          </ul>
          <div className="d-flex mt-3 mt-lg-0">
            <Link href="/licitaciones" className="btn btn-primary-custom w-100 px-4 py-2" onClick={() => setMobileOpen(false)}>
              <i className="bi bi-search me-2"></i> Explorar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
