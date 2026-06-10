import { NextRequest, NextResponse } from 'next/server';
import { cleanObjectData } from '@/lib/cleanData';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rut = searchParams.get('rut') || '';

  if (!rut) {
    return NextResponse.json({ error: 'RUT es requerido' }, { status: 400 });
  }

  const ticket = process.env.MERCADO_PUBLICO_TICKET || '05F86DBB-915B-4367-9D76-781FFF34EFE2';
  const formattedRut = formatRut(rut);
  const url = `https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor?rutempresaproveedor=${encodeURIComponent(formattedRut)}&ticket=${ticket}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      console.warn(`Mercado Publico BuscarProveedor API returned status: ${response.status}`);
      if (response.status === 500) {
        try {
          const bodyText = await response.text();
          console.warn(`Error response body: ${bodyText}`);
          const errData = JSON.parse(bodyText);
          if (errData.Codigo === 10200 || (errData.Mensaje && errData.Mensaje.toLowerCase().includes('no hay resultados'))) {
            return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
          }
        } catch (e) {
          console.warn('Failed to parse error response body:', e);
        }
      }
      return NextResponse.json({ error: 'Error al consultar API externa' }, { status: 502 });
    }

    const rawData = await response.json();
    const data = cleanObjectData(rawData);
    const empresa = data.listaEmpresas?.[0];

    if (!empresa || !empresa.CodigoEmpresa) {
      return NextResponse.json({ error: 'Proveedor no encontrado en Mercado Público' }, { status: 404 });
    }

    // Map to Supplier interface
    const supplier = {
      rut: formattedRut,
      razonSocial: empresa.NombreEmpresa || 'Razón Social no disponible',
      nombreFantasia: empresa.NombreEmpresa || 'Nombre de Fantasía no disponible',
      estadoAcreditacion: 'Acreditado',
      direccion: 'No disponible',
      comuna: 'No disponible',
      region: 'No disponible',
      telefono: 'No disponible',
      email: 'No disponible',
      actividadEconomica: 'Proveedor Registrado en Mercado Público',
      fechaRegistro: new Date().toISOString().split('T')[0], // Use current date or fallback
      licitacionesHistoricas: []
    };

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching from BuscarProveedor API:', error);
    return NextResponse.json(
      { error: 'El servidor de Mercado Público no se encuentra disponible. Por favor, intente más tarde.' },
      { status: 503 }
    );
  }
}

