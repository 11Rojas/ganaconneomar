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

// Función para enviar email de aprobación de compra
export const sendPurchaseApprovalEmail = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #febd59;">¡Compra Aprobada! 🎉</h2>
      <p>Hola ${purchaseData.name},</p>
      <p>¡Excelente noticia! Tu compra ha sido aprobada y verificada:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>✅ Compra Verificada:</h3>
        <p><strong>Rifa:</strong> ${purchaseData.raffleTitle}</p>
        <p><strong>Números:</strong> ${purchaseData.numbers.join(', ')}</p>
        <p><strong>Total:</strong> $${purchaseData.totalAmount}</p>
        <p><strong>Método de Pago:</strong> ${purchaseData.paymentMethod}</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
        <h3>🎯 Tus Números Están Confirmados</h3>
        <p>Ya puedes participar en el sorteo. ¡Mucha suerte!</p>
        <p><strong>Guarda este email como comprobante.</strong></p>
      </div>
      
      <p>¡Gracias por confiar en Gana con Neomar!</p>
      <p><strong>Gana con Neomar</strong></p>
    </div>
  `

  return await sendEmail(purchaseData.email, 'Compra Aprobada - Gana con Neomar', html)
}

// Función para enviar email de anuncio de ganador
export const sendWinnerAnnouncementEmail = async (winnerData: {
  email: string
  name: string
  raffleTitle: string
  winningNumber: number
  prize: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #febd59, #ffd166); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #023429; margin: 0; font-size: 2.5em;">🏆 ¡GANADOR! 🏆</h1>
        <p style="color: #023429; font-size: 1.2em; margin: 10px 0;">¡Felicidades!</p>
      </div>
      
      <p>Hola ${winnerData.name},</p>
      <p>¡INCREÍBLES NOTICIAS! Has ganado la rifa:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🎉 ¡GANASTE!</h3>
        <p><strong>Rifa:</strong> ${winnerData.raffleTitle}</p>
        <p><strong>Número Ganador:</strong> <span style="font-size: 1.5em; font-weight: bold; color: #febd59;">${winnerData.winningNumber}</span></p>
        <p><strong>Premio:</strong> ${winnerData.prize}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>📞 Próximos Pasos</h3>
        <p>Nos pondremos en contacto contigo en las próximas 24 horas para coordinar la entrega de tu premio.</p>
        <p><strong>¡Disfruta tu victoria!</strong></p>
      </div>
      
      <p>¡Gracias por participar en Gana con Neomar!</p>
      <p><strong>Gana con Neomar</strong></p>
    </div>
  `

  return await sendEmail(winnerData.email, '¡GANASTE! - Gana con Neomar', html)
}