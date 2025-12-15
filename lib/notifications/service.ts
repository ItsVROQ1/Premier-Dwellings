import { PrismaClient } from '@prisma/client';
import { NotificationPayload, NotificationResult, NotificationChannel } from './types';
import { emailService } from './email';
import { smsService } from './sms';

const prisma = new PrismaClient();

/**
 * Unified notification service for handling email, SMS, and in-app notifications
 */
export class NotificationService {
  /**
   * Create a user notification and optionally send via email/SMS
   */
  async notify(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return {
          success: false,
          emailSent: false,
          smsSent: false,
          error: 'User not found',
        };
      }

      // Create in-app notification
      const notification = await prisma.userNotification.create({
        data: {
          userId: payload.userId,
          type: payload.type as any,
          title: payload.title,
          message: payload.message,
          data: payload.metadata ? JSON.stringify(payload.metadata) : null,
        },
      });

      let emailSent = false;
      let smsSent = false;

      // Send email if requested and user preferences allow
      if (payload.channels.includes(NotificationChannel.EMAIL) && user.emailNotifications) {
        emailSent = await this.sendEmail(user.email, payload);

        if (emailSent) {
          await prisma.userNotification.update({
            where: { id: notification.id },
            data: { emailSent: true, emailSentAt: new Date() },
          });
        }
      }

      // Send SMS if requested and user preferences allow
      if (
        payload.channels.includes(NotificationChannel.SMS) &&
        user.smsNotifications &&
        user.phoneNumber
      ) {
        smsSent = await this.sendSMS(user.phoneNumber, payload);

        if (smsSent) {
          await prisma.userNotification.update({
            where: { id: notification.id },
            data: { smsSent: true, smsSentAt: new Date() },
          });
        }
      }

      return {
        success: true,
        emailSent,
        smsSent,
      };
    } catch (error) {
      console.error('[NOTIFICATION] Error sending notification:', error);
      return {
        success: false,
        emailSent: false,
        smsSent: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(email: string, payload: NotificationPayload): Promise<boolean> {
    try {
      if (payload.emailTemplate) {
        return await emailService.send({
          to: email,
          subject: payload.emailTemplate.subject || payload.title,
          text: payload.emailTemplate.text,
          html: payload.emailTemplate.html,
        });
      }

      // Default email template
      return await emailService.send({
        to: email,
        subject: payload.title,
        text: payload.message,
      });
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(phoneNumber: string, payload: NotificationPayload): Promise<boolean> {
    try {
      if (payload.smsTemplate) {
        return await smsService.send({
          phoneNumber,
          message: payload.smsTemplate.text,
        });
      }

      // Default SMS template - keep it short
      const message = `${payload.title}: ${payload.message}`.substring(0, 160);
      return await smsService.send({ phoneNumber, message });
    } catch (error) {
      console.error('[SMS] Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Notify about new listing inquiry
   */
  async notifyListingInquiry(
    agentId: string,
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
  ): Promise<NotificationResult> {
    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) return { success: false, emailSent: false, smsSent: false };

    return this.notify({
      userId: agentId,
      type: 'LISTING_INQUIRY',
      title: `New inquiry for ${listingTitle}`,
      message: `${inquirerName} is interested in your listing`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: {
        listingTitle,
        inquirerName,
        inquirerEmail,
        message,
      },
      emailTemplate: {
        subject: `New Inquiry: ${listingTitle}`,
        text: `${inquirerName} (${inquirerEmail}) is interested in "${listingTitle}"`,
        html: `
          <h2>New Listing Inquiry</h2>
          <p><strong>${inquirerName}</strong> is interested in your listing:</p>
          <p><strong>${listingTitle}</strong></p>
          <p><strong>Message:</strong> ${message}</p>
          <p>Reply to: ${inquirerEmail}</p>
        `,
      },
      smsTemplate: {
        text: `New inquiry from ${inquirerName} for "${listingTitle}". Check your dashboard.`,
      },
    });
  }

  /**
   * Notify about payment success
   */
  async notifyPaymentSuccess(
    userId: string,
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
  ): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Successful',
      message: `${currency} ${amount.toFixed(0)} has been processed successfully`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { amount, currency, transactionId, description },
      emailTemplate: {
        subject: 'Payment Confirmation',
        text: `Payment of ${currency} ${amount} confirmed. Transaction: ${transactionId}`,
        html: `
          <h2>Payment Confirmed</h2>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Description:</strong> ${description}</p>
        `,
      },
      smsTemplate: {
        text: `Payment confirmed: ${currency} ${amount.toFixed(0)} (Ref: ${transactionId})`,
      },
    });
  }

  /**
   * Notify about payment failure
   */
  async notifyPaymentFailure(
    userId: string,
    { amount, currency, reason }: { amount: number; currency: string; reason: string }
  ): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: `Payment of ${currency} ${amount.toFixed(0)} could not be processed`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { amount, currency, reason },
      emailTemplate: {
        subject: 'Payment Failed',
        text: `Payment failed. Amount: ${currency} ${amount}. Reason: ${reason}`,
        html: `
          <h2>Payment Failed</h2>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please try again or contact support.</p>
        `,
      },
      smsTemplate: {
        text: `Payment failed: ${currency} ${amount.toFixed(0)}. Reason: ${reason}`,
      },
    });
  }

  /**
   * Notify about listing approval
   */
  async notifyListingApproval(agentId: string, listingTitle: string): Promise<NotificationResult> {
    return this.notify({
      userId: agentId,
      type: 'LISTING_APPROVED',
      title: 'Listing Approved',
      message: `Your listing "${listingTitle}" has been approved and is now live`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { listingTitle },
    });
  }

  /**
   * Notify about plan expiry reminder
   */
  async notifyPlanExpiry(
    userId: string,
    { planName, daysRemaining }: { planName: string; daysRemaining: number }
  ): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'PLAN_EXPIRY_REMINDER',
      title: `Your ${planName} plan expires soon`,
      message: `Your plan will expire in ${daysRemaining} days. Renew now to avoid interruption`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { planName, daysRemaining },
    });
  }

  /**
   * Notify about subscription renewal
   */
  async notifySubscriptionRenewal(
    userId: string,
    { planName, endDate }: { planName: string; endDate: Date }
  ): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'SUBSCRIPTION_RENEWED',
      title: `${planName} subscription renewed`,
      message: `Your subscription has been renewed. Valid until ${endDate.toLocaleDateString()}`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { planName, endDate },
    });
  }

  /**
   * Notify about security deposit approval
   */
  async notifySecurityDepositApproval(
    userId: string,
    { amount, currency }: { amount: number; currency: string }
  ): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'SECURITY_DEPOSIT_APPROVED',
      title: 'Security Deposit Approved',
      message: `Your security deposit of ${currency} ${amount.toFixed(0)} has been approved`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { amount, currency },
    });
  }

  /**
   * Notify about premium license approval
   */
  async notifyPremiumLicenseApproval(userId: string, agentName: string): Promise<NotificationResult> {
    return this.notify({
      userId,
      type: 'PREMIUM_LICENSE_APPROVED',
      title: 'Premium License Approved',
      message: `Congratulations! Your premium license has been approved. You now have a blue tick.`,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      metadata: { agentName },
    });
  }
}

export const notificationService = new NotificationService();
