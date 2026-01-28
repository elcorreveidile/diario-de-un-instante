import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
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
          backgroundColor: '#f5f3ff',
          fontFamily: 'system-ui, sans-serif',
          backgroundImage: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        }}
      >
        {/* Contenido principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '80px',
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: 120, marginBottom: '40px' }}>🌱</div>

          {/* Título principal */}
          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              margin: 0,
              marginBottom: '30px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            Diario de un Instante
          </h1>

          {/* Subtítulo */}
          <p
            style={{
              fontSize: 36,
              margin: 0,
              marginBottom: '60px',
              color: '#666',
              fontWeight: 500,
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            Un jardín digital para cultivar un año más consciente y con propósito
          </p>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 32px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '16px',
                border: '2px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <span style={{ fontSize: 32 }}>💭</span>
              <span style={{ fontSize: 24, color: '#8b5cf6', fontWeight: 600 }}>
                Pensamientos
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 32px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '16px',
                border: '2px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <span style={{ fontSize: 32 }}>⚡</span>
              <span style={{ fontSize: 24, color: '#10b981', fontWeight: 600 }}>
                Acciones
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 32px',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderRadius: '16px',
                border: '2px solid rgba(249, 115, 22, 0.2)',
              }}
            >
              <span style={{ fontSize: 32 }}>🎯</span>
              <span style={{ fontSize: 24, color: '#f97316', fontWeight: 600 }}>
                11 Áreas
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            fontSize: 28,
            color: '#999',
            fontWeight: 600,
          }}
        >
          diariodeuninstante.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
