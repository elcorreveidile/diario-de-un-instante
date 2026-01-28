import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY no está configurada en Vercel',
        },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Enviar email de prueba usando el dominio verificado de Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@test.com',
      subject: 'Test desde Diario de un Instante',
      html: `
        <h1>¡Hola!</h1>
        <p>Si ves este email en los logs de Resend, la API Key está funcionando.</p>
        <p>Revisa: https://resend.com/emails</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Email enviado. Revisa los logs en resend.com/emails',
      data,
    });
  } catch (error) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
