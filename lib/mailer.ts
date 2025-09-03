import nodemailer from 'nodemailer'

// Configuración del transporter de Nodemailer para Vercel (serverless)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Crear transporter en cada llamada para serverless
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
    // Cerrar la conexión para serverless
    transporter.close()
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Función para enviar notificación de compra
export const sendPurchaseNotification = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  reference: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #febd59;">¡Compra Confirmada!</h2>
      <p>Hola ${purchaseData.name},</p>
      <p>Tu compra ha sido registrada exitosamente:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Compra:</h3>
        <p><strong>Rifa:</strong> ${purchaseData.raffleTitle}</p>
        <p><strong>Números:</strong> ${purchaseData.numbers.join(', ')}</p>
        <p><strong>Total:</strong> $${purchaseData.totalAmount}</p>
        <p><strong>Método de Pago:</strong> ${purchaseData.paymentMethod}</p>
        <p><strong>Referencia:</strong> ${purchaseData.reference}</p>
      </div>
      
      <p>Tu pago será verificado en las próximas 24-36 horas y recibirás tus números por WhatsApp.</p>
      
      <p>¡Gracias por participar!</p>
      <p><strong>Gana con Neomar</strong></p>
    </div>
  `

  return await sendEmail(purchaseData.email, 'Compra Confirmada - Gana con Neomar', html)
}