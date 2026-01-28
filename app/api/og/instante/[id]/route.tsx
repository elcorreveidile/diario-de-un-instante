import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getInstanteById, getAreaInfo } from '@/lib/firestore';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const instanteId = params.id;

    // Obtener datos del instante
    const instante = await getInstanteById(instanteId);

    if (!instante) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              fontSize: 40,
              fontWeight: 'bold',
            }}
          >
            <div>Instante no encontrado</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const areaInfo = getAreaInfo(instante.area);

    // Colores por defecto
    const primaryColor = '#8b5cf6';
    const secondaryColor = '#f5f3ff';

    // Formatear fecha
    const fecha = new Date(instante.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: secondaryColor,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '60px 80px',
              borderBottom: '2px solid rgba(0,0,0,0.1)',
            }}
          >
            {/* Logo/Título */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: primaryColor,
                }}
              >
                Diario de un Instante
              </span>
            </div>

            {/* Área con emoji */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: primaryColor,
                borderRadius: '12px',
              }}
            >
              <span style={{ fontSize: 36 }}>{areaInfo?.emoji || '📝'}</span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {areaInfo?.nombre || 'Área'}
              </span>
            </div>
          </div>

          {/* Contenido principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '80px',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {/* Título */}
            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                margin: 0,
                marginBottom: '40px',
                color: primaryColor,
                lineHeight: 1.1,
              }}
            >
              {instante.titulo}
            </h1>

            {/* Tipo y fecha */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <div
                style={{
                  padding: '12px 20px',
                  backgroundColor: primaryColor,
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {instante.tipo === 'accion' ? '⚡ Acción' : '💭 Pensamiento'}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: '#666',
                  fontWeight: 500,
                }}
              >
                {fecha}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 80px',
              borderTop: '2px solid rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: '#666',
                fontWeight: 500,
              }}
            >
              diariodeuninstante.com
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 20,
                color: primaryColor,
                fontWeight: 600,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{instante.likeCount || 0} likes</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generando OG image:', error);
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontSize: 40,
            fontWeight: 'bold',
          }}
        >
          Error generando imagen
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
