import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : undefined,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface EmailParams {
  email: string
  name: string
  verificationId: string
  type: 'submitted' | 'approve' | 'reject'
  notes?: string
}

export async function sendVerificationEmail({ 
  email, 
  name, 
  verificationId, 
  type, 
  notes 
}: EmailParams) {
  try {
    let subject: string
    let htmlContent: string

    switch (type) {
      case 'submitted':
        subject = 'ID Verification Submitted - Under Review'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">ID Verification Submitted</h2>
            <p>Hello ${name},</p>
            <p>Thank you for submitting your ID verification documents. Our team will review your submission within 24-48 hours.</p>
            
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px 0; color: #374151;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our team will review your documents</li>
                <li>You will receive an email notification once the review is complete</li>
                <li>If approved, you'll be able to use all platform features</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The Verification Team</p>
          </div>
        `
        break

      case 'approve':
        subject = '🎉 ID Verification Approved - Welcome to the Platform!'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">✅ Verification Approved</h2>
            </div>
            <div style="background: #F9FAFB; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Hello ${name},</p>
              <p>Great news! Your ID verification has been <strong>approved</strong>. You now have full access to all platform features.</p>
              
              ${notes ? `
                <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px; margin: 20px 0;">
                  <h4 style="margin: 0 0 8px 0; color: #1E40AF;">Reviewer Notes:</h4>
                  <p style="margin: 0; color: #1E40AF;">${notes}</p>
                </div>
              ` : ''}
              
              <div style="background: #ECFDF5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; color: #065F46;">What's available now:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #065F46;">
                  <li>Start making inquiries on listings</li>
                  <li>Post your own listings (if you're an agent)</li>
                  <li>Connect with other verified users</li>
                  <li>Full access to messaging features</li>
                </ul>
              </div>
              
              <p>Welcome to our verified community!</p>
              <p>Best regards,<br>The Platform Team</p>
            </div>
          </div>
        `
        break

      case 'reject':
        subject = 'ID Verification Update - Action Required'
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">❌ Verification Update Required</h2>
            </div>
            <div style="background: #FEF2F2; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Hello ${name},</p>
              <p>We've reviewed your ID verification submission and need some additional information or clarification.</p>
              
              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400E;">Reviewer Feedback:</h4>
                <p style="margin: 0; color: #92400E;">${notes || 'Please resubmit with clearer images or additional documentation.'}</p>
              </div>
              
              <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; color: #991B1B;">Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #991B1B;">
                  <li>Review the feedback above</li>
                  <li>Prepare new documentation if needed</li>
                  <li>Resubmit your verification at your earliest convenience</li>
                  <li>Contact support if you need assistance</li>
                </ol>
              </div>
              
              <p>We're here to help you complete this process successfully.</p>
              <p>Best regards,<br>The Verification Team</p>
            </div>
          </div>
        `
        break

      default:
        subject = 'ID Verification Update'
        htmlContent = `
          <p>Hello ${name},</p>
          <p>Your ID verification status has been updated.</p>
          <p>Best regards,<br>The Platform Team</p>
        `
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    })

    console.log(`Verification email sent to ${email} for verification ${verificationId} (${type})`)
  } catch (error) {
    console.error('Error sending verification email:', error)
    // Don't throw error as this is not critical
  }
}

export interface SubscriptionReminderEmailParams {
  userEmail: string
  userName: string
  planTier: string
  expiryDate: Date
  daysRemaining: number
}

export async function sendSubscriptionReminderEmail({
  userEmail,
  userName,
  planTier,
  expiryDate,
  daysRemaining,
}: SubscriptionReminderEmailParams) {
  try {
    const formattedDate = expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const subject = `Your ${planTier} Plan Expires in ${daysRemaining} Days`

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FCD34D; color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⏰ Subscription Expiring Soon</h2>
        </div>
        <div style="background: #FFFBEB; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Hello ${userName},</p>
          <p>Your <strong>${planTier}</strong> subscription plan will expire in <strong>${daysRemaining} days</strong> on <strong>${formattedDate}</strong>.</p>
          
          <div style="background: #FEFCE8; border-left: 4px solid #FCD34D; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 12px 0; color: #854D0E;">Plan Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #854D0E;">
              <li>Current Plan: <strong>${planTier}</strong></li>
              <li>Expiry Date: <strong>${formattedDate}</strong></li>
              <li>Days Remaining: <strong>${daysRemaining}</strong></li>
            </ul>
          </div>
          
          <div style="background: #ECFDF5; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #065F46;">What Happens Next:</h3>
            <p style="margin: 0 0 8px 0; color: #065F46;">When your subscription expires:</p>
            <ul style="margin: 0; padding-left: 20px; color: #065F46;">
              <li>Your plan will downgrade to the FREE tier</li>
              <li>You'll lose access to premium features</li>
              <li>Your active listings may be limited</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard/subscription" style="background: #FCD34D; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Renew Your Subscription
            </a>
          </div>
          
          <p>If you have any questions about your subscription, please contact our support team.</p>
          <p style="margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 20px; color: #6B7280; font-size: 12px;">
            Best regards,<br>The Premium Realty Team
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS,
      to: userEmail,
      subject,
      html: htmlContent,
    })

    console.log(`Subscription reminder email sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending subscription reminder email:', error)
  }
}

export async function sendSMS(phone: string, message: string) {
  try {
    // SMS integration would go here
    // For now, we'll just log it
    console.log(`SMS would be sent to ${phone}: ${message}`)
    
    // Example implementation for a SMS service:
    /*
    const response = await fetch(process.env.SMS_API_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: message,
        from: 'YourApp'
      })
    })
    
    if (!response.ok) {
      throw new Error('SMS sending failed')
    }
    */
  } catch (error) {
    console.error('Error sending SMS:', error)
    // Don't throw error as this is not critical
  }
}