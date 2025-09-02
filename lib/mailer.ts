import { Resend } from 'resend';

// Configuración de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.RESEND_API_KEY) {
      throw new Error("La API key de Resend no está configurada");
    }

    // Enviar el email con Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'no-reply@rifasvelocistas.com',
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log("Correo enviado con éxito. ID:", data?.id);
    return { 
      success: true, 
      messageId: data?.id 
    };
  } catch (error) {
    console.error("Error enviando correo con Resend:", error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    };
  }
}