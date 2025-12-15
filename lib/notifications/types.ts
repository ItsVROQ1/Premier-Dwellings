export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export interface NotificationTemplate {
  subject?: string;
  text: string;
  html?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SMSNotification {
  phoneNumber: string;
  message: string;
}

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  emailTemplate?: NotificationTemplate;
  smsTemplate?: NotificationTemplate;
}

export interface NotificationResult {
  success: boolean;
  emailSent: boolean;
  smsSent: boolean;
  error?: string;
}
