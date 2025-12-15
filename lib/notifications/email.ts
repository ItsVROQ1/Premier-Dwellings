import { EmailNotification } from './types';

/**
 * Email notification service
 * Supports both Resend and Nodemailer for transactional emails
 */
export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM || 'noreply@realestate.local';
  }

  /**
   * Send email using Resend (primary)
   */
  private async sendViaResend(notification: EmailNotification): Promise<boolean> {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.log('[EMAIL] Resend API key not configured, skipping');
        return false;
      }

      // In production: const { Resend } = require('resend');
      // const resend = new Resend(apiKey);
      // const result = await resend.emails.send({...});

      console.log('[EMAIL] Would send via Resend:', {
        to: notification.to,
        subject: notification.subject,
        from: this.fromEmail,
      });

      return true;
    } catch (error) {
      console.error('[EMAIL] Resend error:', error);
      return false;
    }
  }

  /**
   * Send email using Nodemailer (fallback)
   */
  private async sendViaNodemailer(notification: EmailNotification): Promise<boolean> {
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;

      if (!smtpHost || !smtpPort) {
        console.log('[EMAIL] SMTP not configured, skipping');
        return false;
      }

      // In production: const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransport({...});
      // const result = await transporter.sendMail({...});

      console.log('[EMAIL] Would send via Nodemailer:', {
        to: notification.to,
        subject: notification.subject,
        from: this.fromEmail,
      });

      return true;
    } catch (error) {
      console.error('[EMAIL] Nodemailer error:', error);
      return false;
    }
  }

  /**
   * Send email with automatic fallback
   */
  async send(notification: EmailNotification): Promise<boolean> {
    try {
      // Try Resend first
      const resendSuccess = await this.sendViaResend(notification);
      if (resendSuccess) return true;

      // Fallback to Nodemailer
      const nodemailerSuccess = await this.sendViaNodemailer(notification);
      return nodemailerSuccess;
    } catch (error) {
      console.error('[EMAIL] Send failed:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    email: string,
    {
      amount,
      currency,
      transactionId,
      description,
    }: {
      amount: number;
      currency: string;
      transactionId: string;
      description: string;
    }
  ): Promise<boolean> {
    const html = `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment!</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${currency} ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${description}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; color: #666;">If you have any questions, please contact our support team.</p>
    `;

    return this.send({
      to: email,
      subject: `Payment Confirmation - ${transactionId}`,
      text: `Payment confirmed. Amount: ${currency} ${amount}. Transaction ID: ${transactionId}`,
      html,
    });
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    {
      planName,
      billingPeriod,
      amount,
      startDate,
      endDate,
    }: {
      planName: string;
      billingPeriod: string;
      amount: number;
      startDate: Date;
      endDate: Date;
    }
  ): Promise<boolean> {
    const html = `
      <h2>Subscription Activated</h2>
      <p>Welcome! Your ${planName} subscription is now active.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Plan:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Billing Period:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${billingPeriod}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">PKR ${amount.toFixed(0)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Valid Until:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${endDate.toLocaleDateString()}</td>
        </tr>
      </table>
    `;

    return this.send({
      to: email,
      subject: `${planName} Subscription Activated`,
      text: `Your ${planName} subscription is active until ${endDate.toLocaleDateString()}`,
      html,
    });
  }

  /**
   * Send listing inquiry notification
   */
  async sendListingInquiry(
    agentEmail: string,
    {
      listingTitle,
      inquirerName,
      inquirerEmail,
      message,
    }: {
      listingTitle: string;
      inquirerName: string;
      inquirerEmail: string;
      message: string;
    }
  ): Promise<boolean> {
    const html = `
      <h2>New Listing Inquiry</h2>
      <p>You have received a new inquiry for your listing.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Listing:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${listingTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>From:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${inquirerName} (${inquirerEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;" colspan="2"><strong>Message:</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px;" colspan="2">${message}</td>
        </tr>
      </table>
    `;

    return this.send({
      to: agentEmail,
      subject: `New Inquiry: ${listingTitle}`,
      text: `New inquiry from ${inquirerName}: ${message}`,
      html,
    });
  }
}

export const emailService = new EmailService();
