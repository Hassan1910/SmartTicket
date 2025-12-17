import { Resend } from 'resend';

export const sendTicketEmail = async (
    userEmail: string,
    userName: string,
    eventTitle: string,
    ticketId: string,
    qrCodeUrl: string,
    organizerResendKey?: string,
    organizerEmailDomain?: string
) => {
    // Use organizer's key if available, otherwise fall back to platform's key
    const apiKey = organizerResendKey || process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('Resend API key not configured.');
        throw new Error('Email configuration missing.');
    }
    
    // Use organizer's email domain if available, otherwise use Resend's onboarding domain for testing
    // organizerEmailDomain can be either a full email (noreply@bizsmart.shop) or just a domain (bizsmart.shop)
    let fromEmail: string;
    
    if (organizerEmailDomain) {
        // Check if it's already a full email address
        if (organizerEmailDomain.includes('@')) {
            fromEmail = `Tickets <${organizerEmailDomain}>`;
        } else {
            // It's just a domain, so prepend the email
            fromEmail = `Tickets <tickets@${organizerEmailDomain}>`;
        }
    } else {
        // Use Resend's onboarding domain for testing
        fromEmail = 'onboarding@resend.dev';
    }

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [userEmail],
            subject: `Your Ticket for ${eventTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Here is your ticket!</h1>
          <p>Hi ${userName},</p>
          <p>Thank you for purchasing a ticket for <strong>${eventTitle}</strong>.</p>
          <p>Your Ticket ID: ${ticketId}</p>
          <div style="margin: 20px 0;">
            <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
          </div>
          <p>Please show this QR code at the entrance.</p>
          <p>Best,<br>The SmartTicket Team</p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend email error:', error);
            throw new Error('Failed to send email');
        }

        return data;
    } catch (error) {
        console.error('Email sending failed:', error);
        // Don't block the flow if email fails, but log it
    }
};
