# LicitaSeguro — Inteligencia para Licitaciones Públicas

📺 **[Ver demostración en YouTube](https://youtu.be/WO7EwhFp7YE)**

**LicitaSeguro** es una moderna aplicación web SaaS construida con **Next.js (App Router)** que se conecta en tiempo real con la API oficial de **Mercado Público (ChileCompra)**. Permite a los usuarios consultar, filtrar y analizar convocatorias del Estado de Chile, además de verificar la acreditación comercial e historial licitatorio de proveedores mediante su RUT.

El proyecto destaca por su interfaz de usuario premium basada en un sistema de diseño de **Glassmorphism (morfismo de vidrio)**, con fondos con auroras animadas, micro-interacciones suaves y un diseño responsivo adaptado para dispositivos móviles y escritorio.

---

## Características Clave

### 1. Portal de Licitaciones en Tiempo Real
* **Consumo Directo de la API**: Recuperación de licitaciones públicas en vivo.
* **Filtros Avanzados**: Búsqueda por texto (ID de licitación, título, descripción u organismo), filtrado por estado administrativo (*Publicada, Cerrada, Adjudicada, Desierta, Revocada, Suspendida*) y rango de fechas de publicación.
* **Ficha Técnica Detallada**: Vista individual de cada licitación que incluye:
  * Cronograma completo (Creación, apertura técnica/económica, adjudicación).
  * Información de contacto del comprador público.
  * Presupuestos estimados y monedas de adjudicación (CLP, USD, UTM, etc.).
  * Detalle de ítems y productos solicitados (incluyendo códigos de categoría ONU).
  * Datos de adjudicación si el proceso ya finalizó (proveedor adjudicado, monto, link al acta oficial).

### 2. Buscador de Proveedores y Validación de RUT
* **Algoritmo de Validación Módulo 11**: Validación matemática de RUTs chilenos directamente en el cliente y servidor.
* **Consulta a ChileProveedores**: Integración con el servicio `BuscarProveedor` para validar el estado de acreditación comercial e historial licitatorio.
* **Historial Licitatorio**: Visualización de las últimas licitaciones en las que el proveedor ha postulado o se ha adjudicado proyectos.

### 3. Limpieza Inteligente de Datos (UTF-8 / Encoding Fix)
* La API pública de Mercado Público suele entregar caracteres corruptos o con codificación de doble capa UTF-8/ISO-8859-1 (ej: `Ã¡` en vez de `á`).
* LicitaSeguro incorpora un motor de limpieza recursivo (`cleanObjectData`) que repara automáticamente cualquier texto corrupto antes de renderizarlo en pantalla.

---

## Stack Tecnológico

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Biblioteca UI**: [React 19](https://react.dev/)
* **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
* **Estilos**: **Bootstrap 5** para la estructura, grillas y utilidades, complementado con CSS personalizado para efectos y colores.
* **Iconografía**: [Bootstrap Icons](https://icons.getbootstrap.com/)
* **Tipografía**: Google Fonts (Inter).

---

## Estructura del Proyecto

La aplicación sigue la arquitectura estándar de Next.js App Router:

```text
LicitaSeguro/
├── public/                 # Recursos estáticos (imágenes, iconos, etc.)
└── src/
    ├── app/                # Enrutamiento y API Routes de Next.js
    │   ├── api/            # Endpoints backend
    │   │   ├── licitaciones/
    │   │   │   ├── [id]/   # GET /api/licitaciones/[id] (Ficha por ID)
    │   │   │   └── route.ts# GET /api/licitaciones (Listado y filtros)
    │   │   └── proveedores/
    │   │       └── route.ts# GET /api/proveedores (Consulta RUT)
    │   ├── licitaciones/   # Páginas del portal de licitaciones
    │   │   ├── [id]/       # Vista de detalle de licitación
    │   │   └── page.tsx    # Listado principal con filtros
    │   ├── proveedores/    # Buscador de proveedores
    │   │   └── page.tsx
    │   ├── globals.css     # Sistema de Diseño y Estilos SaaS Premium
    │   ├── layout.tsx      # Layout global de la aplicación
    │   └── page.tsx        # Página de inicio (Landing Page y estadísticas)
    ├── components/         # Componentes React reutilizables (Navbar, Footer, etc.)
    ├── data/               # Mocks de respaldo y definición de tipos TypeScript
    └── lib/                # Utilidades y lógica de negocio
        ├── cleanData.ts    # Limpieza de codificación de texto y UTF-8
        └── mercadopublico.ts # Conector con la API externa de Mercado Público
```

---

## Endpoints de la API Interna

LicitaSeguro expone rutas de API locales para procesar y limpiar la información proveniente de Mercado Público:

### 1. Listado de Licitaciones
`GET /api/licitaciones`
* **Parámetros de consulta (opcionales)**:
  * `search`: Texto para buscar coincidencias en ID, título, descripción u organismo.
  * `estado`: Filtra por estado de la licitación (ej: `Publicada`, `Adjudicada`).
  * `fechaInicio`: Filtra licitaciones publicadas a partir de esta fecha (formato `YYYY-MM-DD`).
  * `fechaFin`: Filtra licitaciones publicadas hasta esta fecha (formato `YYYY-MM-DD`).
* **Respuesta**: Array de objetos que cumplen con la interfaz `Tender`.

### 2. Detalle de Licitación
`GET /api/licitaciones/[id]`
* **Parámetro de ruta**: `id` (código de licitación pública, ej: `5215-12-LP26`).
* **Respuesta**: Objeto con el detalle completo de la licitación o `404` si no se encuentra.

### 3. Consulta de Proveedores
`GET /api/proveedores?rut=[rut_sin_puntos]`
* **Parámetro de consulta**: `rut` (ej: `76123456K`).
* **Respuesta**: Datos del proveedor mapeados a la interfaz `Supplier` con su respectivo historial.

---

## Configuración e Instalación

### Requisitos Previos
* Node.js v18.x o superior.
* npm

### Pasos para levantar localmente

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd LicitaSeguro
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tu ticket de Mercado Público para producción (si no se define, el sistema utilizará un ticket de prueba por defecto):
   ```env
   MERCADO_PUBLICO_TICKET=TuTicketDeMercadoPublicoAqui
   ```

4. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.

5. **Compilar para Producción**:
   ```bash
   npm run build
   # Para iniciar la app compilada:
   npm run start
   ```

---

## Sistema de Diseño

El diseño de **LicitaSeguro** combina la robustez del sistema de componentes y grillas de **Bootstrap** con toques personalizados definidos en [globals.css](file:///c:/Users/ngrok/Documents/02-%20Proyectos/LicitaSeguro/src/app/globals.css) para mantener una paleta de colores pastel moderna y relajante:
* **Fondo Base**: `#f0f2f8` (Azul grisáceo claro)
* **Acentos Violetas**: `#9582dc` (Usado en botones primarios y branding principal)
* **Glows y Sombras**: Sombras translúcidas y desenfoques Gaussianos (`backdrop-filter: blur(16px)`) para lograr el efecto Glassmorphism.
* **Efectos de Animación**: Las auroras de fondo orbitan y se trasladan en un bucle infinito a través de animaciones `@keyframes` optimizadas para CSS, dando una sensación de fluidez y dinamismo a la interfaz.

---

## Buenas Prácticas de Accesibilidad y SEO
* **HTML Semántico**: Uso riguroso de elementos como `<main>`, `<section>`, `<nav>`, `<footer>`, `<header>` y `<h1>` únicos por página.
* **Etiquetas ARIA**: Se agregaron roles `alert`, `status` y etiquetas `aria-label`, `aria-live` y `aria-hidden` para soportar lectores de pantalla.
* **Optimización de Fuentes**: Fuentes de Google Fonts auto-hospedadas a través del optimizador nativo de Next.js.
