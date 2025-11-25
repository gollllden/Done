import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_pass = os.getenv('SMTP_PASS', '')
        self.business_email = os.getenv('BUSINESS_EMAIL', 'amasarpong206@gmail.com')
        self.enabled = bool(self.smtp_user and self.smtp_pass)

        if self.enabled:
            logger.info(f'Gmail SMTP email service initialized for {self.smtp_user}')
        else:
            logger.warning('Email service disabled: Gmail credentials not configured')

    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send an email using Gmail SMTP"""
        if not self.enabled:
            logger.info(f'Email sending skipped (not configured): {subject} to {to_email}')
            return False

        try:
            message = MIMEMultipart('alternative')
            message['From'] = f'Golden Touch Cleaning Services <{self.smtp_user}>'
            message['To'] = to_email
            message['Subject'] = subject

            html_part = MIMEText(html_content, 'html')
            message.attach(html_part)

            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_pass,
                start_tls=True,
            )

            logger.info(f'Email sent successfully to {to_email}')
            return True
        except Exception as e:
            logger.error(f'Failed to send email to {to_email}: {str(e)}')
            return False

    async def send_customer_confirmation(self, booking: dict):
        """Send booking confirmation to customer"""
        if not booking.get('email'):
            logger.info('Customer email not provided, skipping confirmation email')
            return

        subject = '✓ Your Booking is Confirmed - Golden Touch Cleaning Services'
        html_content = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header with Logo and Gradient -->
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; border-radius: 0;">
                    <img src="https://customer-assets.emergentagent.com/job_038f5287-0ae4-4474-bffb-d48d321d9405/artifacts/rbirf40v_WhatsApp%20Image%202025-11-21%20at%201.10.29%20AM.jpeg" alt="Golden Touch Cleaning Services" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Booking Confirmed!</h1>
                    <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">We're excited to serve you</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px 30px; background: #ffffff;">
                    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi <strong>{booking['name']}</strong>,</p>

                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for choosing <strong>Golden Touch Cleaning Services</strong>! We're thrilled to serve you. Your booking has been confirmed and our team is ready to deliver exceptional service.
                    </p>

                    <!-- Customer ID Badge -->
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px; border-radius: 12px; margin: 0 0 25px 0; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #bfdbfe; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Customer ID</p>
                        <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">{booking.get('customerId', 'N/A')}</p>
                        <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 12px;">Please reference this ID for all communications</p>
                    </div>

                    <!-- Booking Details Card -->
                    <div style="background: linear-gradient(to bottom, #eff6ff, #ffffff); padding: 25px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <h3 style="color: #2563eb; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                            📋 Booking Details
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 40%; border-bottom: 1px solid #e5e7eb;">Service:</td>
                                <td style="padding: 12px 0; color: #1f2937; font-weight: 600; border-bottom: 1px solid #e5e7eb;">{booking['serviceName']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Date:</td>
                                <td style="padding: 12px 0; color: #1f2937; font-weight: 700; font-size: 16px; border-bottom: 1px solid #e5e7eb;">{booking['date']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Time:</td>
                                <td style="padding: 12px 0; color: #1f2937; font-weight: 700; font-size: 16px; border-bottom: 1px solid #e5e7eb;">{booking['time']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Location:</td>
                                <td style="padding: 12px 0; color: #1f2937;">{booking['address']}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Payment Info -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin: 0 0 30px 0; border: 2px solid #fbbf24;">
                        <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 16px;">💳 Payment Information</p>
                        <p style="margin: 10px 0 0 0; color: #78350f; font-size: 14px;">Payment will be collected after service completion. We accept cash, credit cards, and e-transfer.</p>
                    </div>

                    <!-- What's Next -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 0 0 30px 0;">
                        <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">✨ What's Next?</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
                            <li>Our team will call to confirm your appointment</li>
                            <li>We'll arrive on time at your location</li>
                            <li>Enjoy professional cleaning service!</li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div style="text-align: center; padding: 20px 0; border-top: 2px solid #e5e7eb;">
                        <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Questions? We're here to help!</p>
                        <p style="margin: 8px 0; font-size: 16px;">
                            <strong style="color: #2563eb;">📞</strong>
                            <a href="tel:6477875942" style="color: #2563eb; text-decoration: none; font-weight: 600;">(647) 787-5942</a>
                        </p>
                        <p style="margin: 8px 0; font-size: 16px;">
                            <strong style="color: #2563eb;">📧</strong>
                            <a href="mailto:ohemenggold@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">ohemenggold@gmail.com</a>
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Golden Touch Cleaning Services</p>
                    <p style="color: #6b7280; margin: 0; font-size: 13px;">Calgary's Premier Mobile Cleaning Service</p>
                    <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">Car Detailing • Home Cleaning • Event Services</p>
                </div>
            </div>
        </body>
        </html>
        """

        await self.send_email(booking['email'], subject, html_content)

    async def send_business_notification(self, booking: dict):
        """Send new booking notification to business"""
        subject = f"🔔 New Booking Alert: {booking['serviceName']} - {booking['date']}"
        html_content = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
                    <h2 style="color: white; margin: 0; font-size: 24px;">🎉 New Booking Received!</h2>
                    <p style="color: #d1fae5; margin: 10px 0 0 0;">Action required</p>
                </div>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 35%;">Booking ID:</td>
                            <td style="padding: 8px 0;">{booking['bookingId']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Service:</td>
                            <td style="padding: 8px 0;">{booking['serviceName']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Date & Time:</td>
                            <td style="padding: 8px 0;">{booking['date']} at {booking['time']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                            <td style="padding: 8px 0;">{booking['status']}</td>
                        </tr>
                    </table>

                    <h3 style="margin-top: 30px;">Customer Information</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 35%;">Name:</td>
                            <td style="padding: 8px 0;">{booking['name']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px 0;">{booking['phone']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                            <td style="padding: 8px 0;">{booking.get('email', 'Not provided')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Address:</td>
                            <td style="padding: 8px 0;">{booking['address']}</td>
                        </tr>
                        {f'''<tr>
                            <td style="padding: 8px 0; font-weight: bold;">Vehicle Type:</td>
                            <td style="padding: 8px 0;">{booking['vehicleType']}</td>
                        </tr>''' if booking.get('vehicleType') else ''}
                        {f'''<tr>
                            <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Notes:</td>
                            <td style="padding: 8px 0;">{booking['notes']}</td>
                        </tr>''' if booking.get('notes') else ''}
                    </table>
                </div>

                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This is an automated notification from your booking system.</p>
            </div>
        </body>
        </html>
        """

        await self.send_email(self.business_email, subject, html_content)


email_service = EmailService()
