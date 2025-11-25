import os
import logging
from datetime import datetime
from email_service import email_service
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Frontend URL
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://homecarwash-portal.preview.emergentagent.com')


async def get_all_customer_emails():
    """Fetch all unique customer emails from bookings"""
    try:
        # Get all bookings with non-null emails
        bookings = await db.bookings.find(
            {"email": {"$exists": True, "$ne": None, "$ne": ""}},
            {"email": 1, "name": 1, "_id": 0}
        ).to_list(1000)
        
        # Create a dictionary of unique emails with names
        customers = {}
        for booking in bookings:
            email = booking.get('email', '').strip()
            if email and email not in customers:
                customers[email] = booking.get('name', 'Valued Customer')
        
        logger.info(f"Found {len(customers)} unique customers for email campaign")
        return customers
    except Exception as e:
        logger.error(f"Error fetching customer emails: {str(e)}")
        return {}


def get_monday_email_template(customer_name: str) -> tuple:
    """Generate Monday email template"""
    subject = "Start Your Week Fresh - Golden Touch Cleaning Services"
    
    html_content = f"""
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
            
            <!-- Header -->
            <div style="background-color: #2563eb; padding: 30px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal;">Start Your Week Fresh!</h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px;">
                <p style="font-size: 16px; color: #333333; margin: 0 0 24px 0; line-height: 1.5;">
                    Dear {customer_name},
                </p>

                <p style="font-size: 15px; color: #555555; margin: 0 0 20px 0; line-height: 1.6;">
                    Happy Monday! Start your week off right with a clean car or home.
                </p>
                
                <p style="font-size: 15px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                    At Golden Touch Cleaning Services, we make it easy to keep your vehicle and property spotless. Our mobile service comes to you, saving you time so you can focus on what matters most.
                </p>

                <!-- Services Highlight -->
                <div style="background-color: #f8f9fa; padding: 24px; margin: 0 0 30px 0; border-left: 3px solid #2563eb;">
                    <h2 style="color: #333333; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Our Services</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.8;">
                        <li>Car Detailing (Exterior & Interior)</li>
                        <li>Home & Property Cleaning</li>
                        <li>Event Cleaning Services</li>
                        <li>Contract Cleaning</li>
                    </ul>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 0 0 30px 0;">
                    <a href="{FRONTEND_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 16px; font-weight: 600;">Book Your Service Now</a>
                </div>

                <p style="font-size: 14px; color: #666666; margin: 0 0 30px 0; line-height: 1.6; text-align: center; font-style: italic;">
                    Mobile service available across Calgary - We come to you!
                </p>

                <!-- Contact Info -->
                <div style="padding: 20px 0; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 14px; color: #555555; margin: 0 0 8px 0;">
                        Contact us:
                    </p>
                    <p style="font-size: 14px; color: #2563eb; margin: 0 0 4px 0;">
                        Phone: <a href="tel:6477875942" style="color: #2563eb; text-decoration: none;">(647) 787-5942</a>
                    </p>
                    <p style="font-size: 14px; color: #2563eb; margin: 0;">
                        Email: <a href="mailto:goldentouchcleaningservice25@gmail.com" style="color: #2563eb; text-decoration: none;">goldentouchcleaningservice25@gmail.com</a>
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 4px 0; color: #666666; font-size: 14px; font-weight: 600;">Golden Touch Cleaning Services</p>
                <p style="margin: 0; color: #999999; font-size: 12px;">Calgary's Premier Mobile Cleaning Service</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content


def get_friday_email_template(customer_name: str) -> tuple:
    """Generate Friday email template"""
    subject = "Weekend Ready? Get Your Cleaning Done - Golden Touch"
    
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
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal;">Weekend Ready?</h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px;">
                <p style="font-size: 16px; color: #333333; margin: 0 0 24px 0; line-height: 1.5;">
                    Dear {customer_name},
                </p>

                <p style="font-size: 15px; color: #555555; margin: 0 0 20px 0; line-height: 1.6;">
                    The weekend is almost here! Make your plans even better with a freshly cleaned car or home.
                </p>
                
                <p style="font-size: 15px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                    Whether you're planning a road trip, hosting guests, or just want to relax in a clean space, Golden Touch Cleaning Services has you covered. Book today and we'll handle the rest!
                </p>

                <!-- Special Highlight -->
                <div style="background-color: #ecfdf5; padding: 24px; margin: 0 0 30px 0; border-left: 3px solid #10b981;">
                    <h2 style="color: #059669; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Why Choose Us?</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.8;">
                        <li>Mobile Service - We come to your location</li>
                        <li>Professional & Reliable Team</li>
                        <li>Flexible Scheduling</li>
                        <li>100% Satisfaction Guaranteed</li>
                    </ul>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 0 0 30px 0;">
                    <a href="{FRONTEND_URL}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 16px; font-weight: 600;">Book Now for the Weekend</a>
                </div>

                <p style="font-size: 14px; color: #666666; margin: 0 0 30px 0; line-height: 1.6; text-align: center; font-style: italic;">
                    Car Detailing • Home Cleaning • Event Services • Contract Cleaning
                </p>

                <!-- Contact Info -->
                <div style="padding: 20px 0; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 14px; color: #555555; margin: 0 0 8px 0;">
                        Contact us:
                    </p>
                    <p style="font-size: 14px; color: #10b981; margin: 0 0 4px 0;">
                        Phone: <a href="tel:6477875942" style="color: #10b981; text-decoration: none;">(647) 787-5942</a>
                    </p>
                    <p style="font-size: 14px; color: #10b981; margin: 0;">
                        Email: <a href="mailto:goldentouchcleaningservice25@gmail.com" style="color: #10b981; text-decoration: none;">goldentouchcleaningservice25@gmail.com</a>
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 4px 0; color: #666666; font-size: 14px; font-weight: 600;">Golden Touch Cleaning Services</p>
                <p style="margin: 0; color: #999999; font-size: 12px;">Calgary's Premier Mobile Cleaning Service</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content


async def send_weekly_campaign(campaign_type: str = 'monday'):
    """Send weekly email campaign to all customers"""
    try:
        logger.info(f"Starting {campaign_type} email campaign...")
        
        # Get all customer emails
        customers = await get_all_customer_emails()
        
        if not customers:
            logger.warning("No customers found for email campaign")
            return
        
        # Select email template based on campaign type
        sent_count = 0
        failed_count = 0
        
        for email, name in customers.items():
            try:
                if campaign_type == 'monday':
                    subject, html_content = get_monday_email_template(name)
                else:  # friday
                    subject, html_content = get_friday_email_template(name)
                
                # Send email
                success = await email_service.send_email(email, subject, html_content)
                
                if success:
                    sent_count += 1
                    logger.info(f"Campaign email sent to {email}")
                else:
                    failed_count += 1
                    logger.error(f"Failed to send campaign email to {email}")
                
                # Small delay to avoid overwhelming the SMTP server
                await asyncio.sleep(0.5)
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Error sending campaign email to {email}: {str(e)}")
        
        logger.info(f"{campaign_type.capitalize()} campaign complete: {sent_count} sent, {failed_count} failed")
        
    except Exception as e:
        logger.error(f"Error in weekly campaign: {str(e)}")


# Function to be called by scheduler
def run_monday_campaign():
    """Run Monday morning campaign"""
    asyncio.run(send_weekly_campaign('monday'))


def run_friday_campaign():
    """Run Friday morning campaign"""
    asyncio.run(send_weekly_campaign('friday'))
