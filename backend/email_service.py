import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_pass = os.getenv('SMTP_PASS')
        self.business_email = os.getenv('BUSINESS_EMAIL')
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
        except (OSError, aiosmtplib.SMTPException) as e:
            logger.error(f'Failed to send email to {to_email}: {str(e)}')
            return False

    async def send_customer_confirmation(self, booking: dict):
        """Send booking confirmation to customer"""
        if not booking.get('email'):
            logger.info('Customer email not provided, skipping confirmation email')
            return

        subject = 'Golden Touch - Booking Confirmation'
        
        # Prepare notes section if exists
        notes_section = ""
        if booking.get('notes'):
            notes_section = f"""
            <tr>
                <td style="padding:8px 0; color:#11204d; font-weight:600;">Additional Notes:</td>
                <td style="padding:8px 0;">{booking['notes']}</td>
            </tr>
            """
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Golden Touch - Booking Confirmation</title>
</head>

<body style="margin:0; padding:0; background:#f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:40px 0;">
        <tr>
            <td align="center">

                <!-- Main Card -->
                <table role="presentation" width="620" cellpadding="0" cellspacing="0" 
                       style="background:#fefdfb; border-radius:16px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.12);">

                    <!-- Logo Section -->
                    <tr>
                        <td style="padding:30px 20px; text-align:center; background:linear-gradient(135deg, #f9f6ee 0%, #fef8e7 100%);">
                            <img src="https://customer-assets.emergentagent.com/job_038f5287-0ae4-4474-bffb-d48d321d9405/artifacts/rbirf40v_WhatsApp%20Image%202025-11-21%20at%201.10.29%20AM.jpeg" 
                                 alt="Golden Touch Cleaning Services" 
                                 style="max-width:170px; display:block; margin:auto;"/>
                        </td>
                    </tr>

                    <!-- Golden Divider -->
                    <tr>
                        <td style="height:3px; background:linear-gradient(to right, #b68d2a, #e3c77b, #b68d2a);"></td>
                    </tr>

                    <!-- Title Section -->
                    <tr>
                        <td style="background:#11204d; padding:30px 20px; text-align:center;">
                            <h1 style="margin:0; font-size:26px; color:#e8d08d; font-weight:600; letter-spacing:0.5px;">
                                Your Booking is Confirmed
                            </h1>
                            <p style="margin:10px 0 0; color:#d1d5db; font-size:15px;">
                                Thank you for trusting our premium cleaning services.
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:35px 35px; font-size:15px; color:#333; line-height:1.7; background:#fefdfb;">

                            <p style="margin-top:0;">Hello <strong>{booking['name']}</strong>,</p>

                            <p>
                                We are pleased to confirm your cleaning appointment with 
                                <strong style="color:#b48a2a;">Golden Touch Cleaning Services</strong>.  
                                Below is your booking summary:
                            </p>

                            <!-- Customer ID Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" 
                                   style="background:#11204d; padding:18px; border-radius:8px; margin:20px 0; text-align:center;">
                                <tr>
                                    <td>
                                        <p style="margin:0 0 5px 0; color:#e8d08d; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Customer ID</p>
                                        <p style="margin:0; color:#ffffff; font-size:22px; font-weight:bold; font-family:monospace; letter-spacing:2px;">{booking.get('customerId', 'N/A')}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Booking Details Panel -->
                            <table width="100%" cellpadding="0" cellspacing="0" 
                                   style="background:#f9f6ee; padding:22px; border-radius:12px; margin-top:18px; border:1px solid #e6dfcd;">
                                
                                <tr>
                                    <td style="padding:8px 0; color:#11204d; font-weight:600;">Service:</td>
                                    <td style="padding:8px 0;">{booking['serviceName']}</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0; color:#11204d; font-weight:600;">Date:</td>
                                    <td style="padding:8px 0;">{booking['date']}</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0; color:#11204d; font-weight:600;">Time:</td>
                                    <td style="padding:8px 0;">{booking['time']}</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0; color:#11204d; font-weight:600;">Address:</td>
                                    <td style="padding:8px 0;">{booking['address']}</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0; color:#11204d; font-weight:600;">Phone:</td>
                                    <td style="padding:8px 0;">{booking['phone']}</td>
                                </tr>

                                {notes_section}

                            </table>

                            <p style="margin-top:28px;">
                                If you need to adjust your appointment or have any questions, feel free to reply directly to this message. 
                                Our team will assist you immediately.
                            </p>

                            <p style="margin-top:35px; font-size:14px; color:#555;">
                                <strong>Contact Us:</strong><br/>
                                Phone: <a href="tel:6477875942" style="color:#b48a2a; text-decoration:none;">(647) 787-5942</a><br/>
                                Email: <a href="mailto:goldentouchcleaningservice25@gmail.com" style="color:#b48a2a; text-decoration:none;">goldentouchcleaningservice25@gmail.com</a>
                            </p>

                        </td>
                    </tr>

                    <!-- Golden Divider -->
                    <tr>
                        <td style="height:2px; background:linear-gradient(to right, #b68d2a, #e3c77b, #b68d2a);"></td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#11204d; padding:25px 35px; text-align:center;">
                            <p style="margin:0 0 8px 0; color:#e8d08d; font-size:16px; font-weight:600;">
                                Golden Touch Cleaning Services
                            </p>
                            <p style="margin:0; color:#d1d5db; font-size:13px;">
                                Calgary's Premier Mobile Cleaning Service
                            </p>
                            <p style="margin:12px 0 0; color:#9ca3af; font-size:12px;">
                                Home Cleaning • Car Wash • Event Services
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
        """

        await self.send_email(booking['email'], subject, html_content)

    async def send_business_notification(self, booking: dict):
        """Send new booking notification to business"""
        if not self.business_email:
            logger.info('Business email not configured, skipping business notification')
            return
        
        subject = f"🔔 New Booking: {booking['serviceName']} - {booking['date']}"
        html_content = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
                
                <!-- Header -->
                <div style="background-color: #10b981; padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal;">New Booking Received</h1>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px;">
                    
                    <!-- Booking Details -->
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Booking Information</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Booking ID</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-family: monospace;">{booking['bookingId']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Customer ID</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-family: monospace; font-weight: 600;">{booking.get('customerId', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Service</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600;">{booking['serviceName']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Date</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600;">{booking['date']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Time</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600;">{booking['time']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px;">Status</td>
                            <td style="padding: 12px 0; color: #10b981; font-size: 14px; text-align: right; font-weight: 600; text-transform: capitalize;">{booking['status']}</td>
                        </tr>
                    </table>

                    <!-- Customer Details -->
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Customer Details</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Name</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600;">{booking['name']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Phone</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0; font-weight: 600;">{booking['phone']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Email</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">{booking.get('email', 'Not provided')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Address</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">{booking['address']}</td>
                        </tr>
                        {f'''<tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Vehicle Type</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">{booking['vehicleType']}</td>
                        </tr>''' if booking.get('vehicleType') else ''}
                        {f'''<tr>
                            <td style="padding: 12px 0; color: #666666; font-size: 14px; vertical-align: top;">Notes</td>
                            <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right;">{booking['notes']}</td>
                        </tr>''' if booking.get('notes') else ''}
                    </table>

                    <p style="font-size: 14px; color: #999999; margin: 0; font-style: italic;">
                        Automated notification from your booking system
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #666666; font-size: 12px;">Golden Touch Cleaning Services - Admin Portal</p>
                </div>
            </div>
        </body>
        </html>
        """

        await self.send_email(self.business_email, subject, html_content)


email_service = EmailService()
