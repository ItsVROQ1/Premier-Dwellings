import { SMSNotification } from './types';

/**
 * SMS notification service
 * Supports Twilio and Jazz SMS for Pakistani market
 */
export class SMSService {
  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(notification: SMSNotification): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        console.log('[SMS] Twilio not configured, skipping');
        return false;
      }

      // In production: const twilio = require('twilio')(accountSid, authToken);
      // const message = await twilio.messages.create({
      //   body: notification.message,
      //   from: fromNumber,
      //   to: notification.phoneNumber,
      // });

      console.log('[SMS] Would send via Twilio:', {
        to: notification.phoneNumber,
        message: notification.message,
      });

      return true;
    } catch (error) {
      console.error('[SMS] Twilio error:', error);
      return false;
    }
  }

  /**
   * Send SMS via Jazz SMS (Pakistan-specific)
   */
  private async sendViaJazzSMS(notification: SMSNotification): Promise<boolean> {
    try {
      const apiKey = process.env.JAZZ_SMS_API_KEY;
      const senderId = process.env.JAZZ_SMS_SENDER_ID;

      if (!apiKey || !senderId) {
        console.log('[SMS] Jazz SMS not configured, skipping');
        return false;
      }

      // In production:
      // const response = await fetch('https://api.jazzsmpp.com/send-sms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: notification.phoneNumber,
      //     message: notification.message,
      //     senderId,
      //     apiKey,
      //   }),
      // });

      console.log('[SMS] Would send via Jazz SMS:', {
        to: notification.phoneNumber,
        message: notification.message,
        senderId,
      });

      return true;
    } catch (error) {
      console.error('[SMS] Jazz SMS error:', error);
      return false;
    }
  }

  /**
   * Send SMS with automatic fallback
   */
  async send(notification: SMSNotification): Promise<boolean> {
    try {
      // Try Jazz SMS first (primary for Pakistan)
      const jazzSuccess = await this.sendViaJazzSMS(notification);
      if (jazzSuccess) return true;

      // Fallback to Twilio
      const twilioSuccess = await this.sendViaTwilio(notification);
      return twilioSuccess;
    } catch (error) {
      console.error('[SMS] Send failed:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(
    phoneNumber: string,
    {
      amount,
      currency,
      transactionId,
    }: {
      amount: number;
      currency: string;
      transactionId: string;
    }
  ): Promise<boolean> {
    const message = `Payment confirmed. ${currency} ${amount.toFixed(0)} has been deducted. Ref: ${transactionId}`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Send payment failure SMS
   */
  async sendPaymentFailure(
    phoneNumber: string,
    {
      amount,
      currency,
      reason,
    }: {
      amount: number;
      currency: string;
      reason: string;
    }
  ): Promise<boolean> {
    const message = `Payment failed. ${currency} ${amount.toFixed(0)} transaction unsuccessful. Reason: ${reason}`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Send listing inquiry SMS
   */
  async sendListingInquiry(
    phoneNumber: string,
    { listingTitle, inquirerName }: { listingTitle: string; inquirerName: string }
  ): Promise<boolean> {
    const message = `New inquiry for "${listingTitle}" from ${inquirerName}. Check your dashboard for details.`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Send plan expiry reminder SMS
   */
  async sendPlanExpiryReminder(
    phoneNumber: string,
    { planName, daysRemaining }: { planName: string; daysRemaining: number }
  ): Promise<boolean> {
    const message = `Your ${planName} plan expires in ${daysRemaining} days. Renew now to maintain access.`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Send subscription renewal SMS
   */
  async sendSubscriptionRenewal(
    phoneNumber: string,
    { planName, endDate }: { planName: string; endDate: Date }
  ): Promise<boolean> {
    const message = `Your ${planName} subscription renewed successfully. Valid until ${endDate.toLocaleDateString('ur-PK')}.`;
    return this.send({ phoneNumber, message });
  }

  /**
   * Send premium license approval SMS
   */
  async sendPremiumLicenseApproval(
    phoneNumber: string,
    { agentName }: { agentName: string }
  ): Promise<boolean> {
    const message = `Congratulations ${agentName}! Your premium license has been approved. You now have a blue tick.`;
    return this.send({ phoneNumber, message });
  }
}

export const smsService = new SMSService();
