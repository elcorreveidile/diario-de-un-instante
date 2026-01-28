import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[RSS] Generando feed global');

    // Obtener instantes y filtrar por públicos
    const snapshot = await adminDb
      .collection('instantes')
      .orderBy('fecha', 'desc')
      .limit(50)
      .get();

    console.log('[RSS] Total instantes obtenidos:', snapshot.size);

    // Filtrar solo los públicos
    const publicInstantes = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const esPublico = data.privado === false || !data.hasOwnProperty('privado');
      const esPublicado = data.estado === 'publicado' || !data.hasOwnProperty('estado');
      return esPublico && esPublicado;
    }).slice(0, 20);

    console.log('[RSS] Instantes públicos:', publicInstantes.length);

    const baseUrl = 'https://www.diariodeuninstante.com';

    // Generar RSS XML
    const items = publicInstantes.map((doc) => {
      const instante = doc.data();
      const pubDate = new Date(instante.fecha).toUTCString();

      // Limpiar contenido: quitar markdown y limitar
      const description = (instante.content || '')
        .replace(/[#*`\[\]]/g, '')
        .replace(/\n/g, '<br/>')
        .substring(0, 500);

      return `
        <item>
          <title><![CDATA[${instante.titulo}]]></title>
          <description><![CDATA[${description}...]]></description>
          <link>${baseUrl}/${instante.area}/${instante.slug}</link>
          <guid isPermaLink="true">${baseUrl}/${instante.area}/${instante.slug}</guid>
          <pubDate>${pubDate}</pubDate>
          <category><![CDATA[${instante.area}]]></category>
          <author>${instante.userId}</author>
        </item>
      `.trim();
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Diario de un Instante</title>
    <description>Un jardín digital para cultivar un año más consciente y con propósito. Capturando pensamientos y acciones, un instante a la vez.</description>
    <link>${baseUrl}</link>
    <language>es-es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`.trim();

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache por 1 hora
      },
    });
  } catch (error) {
    console.error('[RSS] Error:', error);
    return new NextResponse('<?xml version="1.0"?><rss version="2.0"><channel><title>Error</title><description>Error generando RSS</description></channel></rss>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
