import { NextRequest, NextResponse } from 'next/server';
import { getLicitaciones } from '@/lib/mercadopublico';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get('search')?.toLowerCase() || '';
  const estado = searchParams.get('estado') || '';
  const fechaInicio = searchParams.get('fechaInicio') || '';
  const fechaFin = searchParams.get('fechaFin') || '';

  try {
    // Call the external API helper. If a starting date is defined, request that date.
        let list = await getLicitaciones({
      fecha: fechaInicio || undefined,
      estado: estado && estado !== 'Todos' ? undefined : 'activas'
    });

    if (search) {
      list = list.filter((t) =>
        [t.id, t.titulo, t.descripcion, t.organismo].some((f) => f.toLowerCase().includes(search))
      );
    }

    // Filter by state
    if (estado && estado !== 'Todos') {
      list = list.filter((t) => t.estado.toLowerCase() === estado.toLowerCase());
    }

    // Filter by date range (using publication date or closing date)
    if (fechaInicio) {
      list = list.filter((t) => t.fechaPublicacion >= fechaInicio);
    }
    if (fechaFin) {
      list = list.filter((t) => t.fechaPublicacion <= fechaFin);
    }

    // Sort by publication date descending as default
    list.sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion));

    return NextResponse.json(list);
  } catch (error: unknown) {
    console.error('Error in GET /api/licitaciones:', error);
    if (error instanceof Error && error.message.startsWith('API_DOWN')) {
      return NextResponse.json(
        { error: 'El servidor de Mercado Público no se encuentra disponible. Por favor, intente más tarde.', details: error.message },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

