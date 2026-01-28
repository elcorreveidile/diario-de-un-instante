import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAreaInfo } from '@/lib/firestore';

interface RouteParams {
  params: {
    username: string;
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = params;
    const usernameLower = username.toLowerCase();
    const baseUrl = 'https://www.diariodeuninstante.com';

    // Buscar usuario por username
    const userSnapshot = await adminDb
      .collection('users')
      .where('username', '==', usernameLower)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return new NextResponse('<?xml version="1.0"?><rss version="2.0"><channel><title>Usuario no encontrado</title></channel></rss>', {
        status: 404,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Obtener instantes públicos del usuario
    const instantesSnapshot = await adminDb
      .collection('instantes')
      .where('userId', '==', userId)
      .where('privado', '==', false)
      .orderBy('fecha', 'desc')
      .limit(20)
      .get();

    // Generar RSS XML
    const items = instantesSnapshot.docs.map((doc) => {
      const instante = doc.data();
      const areaInfo = getAreaInfo(instante.area);
      const pubDate = new Date(instante.fecha).toUTCString();

      // Limpiar contenido
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
          <category><![CDATA[${areaInfo?.nombre || instante.area}]]></category>
          <author>${userId}</author>
        </item>
      `.trim();
    }).join('\n');

    const userDisplayName = userData.displayName || username;
    const userBio = userData.bio || `Instantes de ${userDisplayName}`;

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${userDisplayName} - Diario de un Instante</title>
    <description><![CDATA[${userBio}]]></description>
    <link>${baseUrl}/u/${username}</link>
    <language>es-es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/u/${username}/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`.trim();

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[RSS User] Error:', error);
    return new NextResponse('<?xml version="1.0"?><rss version="2.0"><channel><title>Error</title><description>Error generando RSS</description></channel></rss>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
