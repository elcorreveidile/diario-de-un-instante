import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getInstantesByUser } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json | markdown
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Obtener instantes del usuario
    let instantes = await getInstantesByUser(decoded.uid);

    // Filtrar por rango de fechas si se proporciona
    if (startDate || endDate) {
      instantes = instantes.filter(i => {
        const fecha = new Date(i.fecha);
        if (startDate && fecha < new Date(startDate)) return false;
        if (endDate && fecha > new Date(endDate)) return false;
        return true;
      });
    }

    if (format === 'markdown') {
      // Generar Markdown
      let markdown = `# Diario de un Instante - Exportación\n\n`;
      markdown += `**Fecha:** ${new Date().toLocaleDateString('es-ES')}\n`;
      markdown += `**Total de instantes:** ${instantes.length}\n\n`;
      markdown += `---\n\n`;

      for (const instante of instantes) {
        const fecha = new Date(instante.fecha);
        markdown += `## ${instante.titulo}\n\n`;
        markdown += `**Fecha:** ${fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        markdown += `**Área:** ${instante.area}\n`;
        markdown += `**Tipo:** ${instante.tipo === 'accion' ? '⚡ Acción' : '💭 Pensamiento'}\n`;

        if (instante.tags && instante.tags.length > 0) {
          markdown += `**Tags:** ${instante.tags.map(t => `#${t}`).join(' ')}\n`;
        }

        markdown += `\n${instante.content}\n\n`;
        markdown += `---\n\n`;
      }

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="diario-de-un-instante-${new Date().toISOString().split('T')[0]}.md"`,
        },
      });
    }

    // JSON (default)
    const data = {
      version: '0.8',
      fecha: new Date().toISOString(),
      userId: decoded.uid,
      totalInstantes: instantes.length,
      instantes: instantes.map(i => ({
        id: i.id,
        titulo: i.titulo,
        fecha: i.fecha,
        area: i.area,
        tipo: i.tipo,
        contenido: i.content,
        tags: i.tags || [],
        estado: i.estado || 'publicado',
        privado: i.privado || false,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="diario-de-un-instante-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[Analytics Export] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
