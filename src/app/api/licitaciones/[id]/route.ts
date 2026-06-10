import { NextRequest, NextResponse } from 'next/server';
import { getLicitacionById } from '@/lib/mercadopublico';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tender = await getLicitacionById(id);

    if (!tender) {
      return NextResponse.json({ error: 'Licitación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(tender);
  } catch (error: unknown) {
    console.error(`Error in GET /api/licitaciones/${id}:`, error);
    if (error instanceof Error && error.message === 'API_DOWN') {
      return NextResponse.json(
        { error: 'El servidor de Mercado Público no se encuentra disponible. Por favor, intente más tarde.' },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

