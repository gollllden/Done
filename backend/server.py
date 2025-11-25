from fastapi import FastAPI, APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from models import Booking, BookingCreate
from email_service import email_service
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from security import (
    rate_limit_middleware, validate_booking_input, add_security_headers,
    record_login_attempt, hash_password, verify_password, create_session, validate_session,
    invalidate_session, sanitize_input, check_ip_blocked, set_sessions_db
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize sessions database for security module
set_sessions_db(db)

# Create the main app without a prefix
app = FastAPI()

# Add security middleware
app.middleware("http")(rate_limit_middleware)

@app.middleware("http")
async def add_security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    return add_security_headers(response)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize scheduler for email campaigns
scheduler = BackgroundScheduler()
scheduler.start()
logger.info("Email campaign scheduler started")

# Services data (matching frontend)
SERVICES = {
    # Car Detailing Services
    '1': 'Exterior Wash & Wax',
    '2': 'Interior Detailing',
    '3': 'Premium Full Detail',
    '4': 'Engine Bay Cleaning',
    
    # Home & Property Cleaning Services
    '5': 'House Cleaning Service',
    '6': 'Move In/Move Out Cleaning',
    '7': 'Deep Cleaning Service',
    '8': 'Post Renovation Cleaning',
    '9': 'AirBnB Cleaning Service',
    '10': 'Office Cleaning Service',
    '11': 'Seniors Cleaning Service',
    '12': 'Weekly/Bi-Weekly/Monthly Cleaning'
}

# Promo codes with discounts (percentage)
PROMO_CODES = {
    'GOLDY': 30,
    'SAVE10': 10,
    'SAVE15': 15,
    'SAVE20': 20,
    'WELCOME25': 25,
    'FIRSTTIME': 20,
    'REFERRAL15': 15
}

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class StatusUpdate(BaseModel):
    status: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Admin authentication models
class AdminLogin(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str

# Admin login endpoint
@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLogin, request: Request):
    """Secure admin login with rate limiting"""
    client_ip = request.client.host
    
    # Check if IP is blocked
    if check_ip_blocked(client_ip):
        logger.warning(f"Blocked IP {client_ip} attempted admin login")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later."
        )
    
    # Get admin password from environment
    admin_password = os.environ.get('ADMIN_PASSWORD', 'Amasarpong2006')
    
    # Verify password using bcrypt
    if not verify_password(login_data.password, hash_password(admin_password)):
        # Record failed login
        allowed = record_login_attempt(client_ip, False)
        
        if not allowed:
            logger.warning(f"IP {client_ip} blocked due to multiple failed login attempts")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Your IP has been temporarily blocked."
            )
        
        logger.warning(f"Failed admin login attempt from {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Record successful login
    record_login_attempt(client_ip, True)
    
    # Create session
    session_token = await create_session('admin')
    
    logger.info(f"Successful admin login from {client_ip}")
    
    return {
        "success": True,
        "token": session_token,
        "message": "Login successful"
    }

# Admin logout endpoint
@api_router.post("/admin/logout")
async def admin_logout(token: str):
    """Logout admin user"""
    await invalidate_session(token)
    return {"success": True, "message": "Logged out successfully"}

# Session validation endpoint
@api_router.post("/admin/validate-session")
async def validate_admin_session(token: str):
    """Validate admin session token"""
    is_valid = await validate_session(token)
    return {"valid": is_valid}

# Promo code validation endpoint
@api_router.post("/validate-promo")
async def validate_promo_code(promo_data: dict):
    """Validate a promo code"""
    promo_code = sanitize_input(promo_data.get('promoCode', '')).upper().strip()
    
    if promo_code in PROMO_CODES:
        return {
            "valid": True,
            "discount": PROMO_CODES[promo_code],
            "message": f"Promo code applied! You get {PROMO_CODES[promo_code]}% off"
        }
    else:
        return {
            "valid": False,
            "discount": 0,
            "message": "Invalid promo code"
        }

# Booking endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, request: Request):
    """Create a new booking with security validation"""
    try:
        client_ip = request.client.host
        logger.info(f"New booking request from {client_ip}: {booking_data.name} - {booking_data.service}")
        
        # Validate input
        booking_dict = booking_data.model_dump()
        is_valid, message = validate_booking_input(booking_dict)
        
        if not is_valid:
            logger.warning(f"Invalid booking input from {client_ip}: {message}")
            raise HTTPException(status_code=400, detail=message)
        
        # Get service name from service ID
        service_name = SERVICES.get(booking_data.service, booking_data.service)
        
        # Validate and apply promo code
        discount = 0
        promo_code = None
        if booking_data.promoCode:
            promo_upper = sanitize_input(booking_data.promoCode).upper().strip()
            if promo_upper in PROMO_CODES:
                discount = PROMO_CODES[promo_upper]
                promo_code = promo_upper
                logger.info(f"Valid promo code applied: {promo_code} - {discount}% discount for {booking_data.name}")
            else:
                logger.warning(f"Invalid promo code attempted from {client_ip}: {booking_data.promoCode}")
        
        # Create booking object
        booking_dict = booking_data.model_dump()
        booking_dict['serviceName'] = service_name
        booking_dict['promoCode'] = promo_code
        booking_dict['discount'] = discount
        
        booking = Booking(**booking_dict)
        
        # Convert to dict for MongoDB
        booking_dict = booking.model_dump()
        booking_dict['createdAt'] = booking_dict['createdAt'].isoformat()
        booking_dict['updatedAt'] = booking_dict['updatedAt'].isoformat()
        
        # Insert into database
        result = await db.bookings.insert_one(booking_dict)
        
        if not result.inserted_id:
            logger.error(f"Failed to insert booking for {booking.bookingId}")
            raise HTTPException(status_code=500, detail="Failed to create booking")
        
        logger.info(f"Booking created successfully: {booking.bookingId} (Customer: {booking.customerId})")
        
        # Send emails (non-blocking)
        try:
            await email_service.send_customer_confirmation(booking_dict)
            await email_service.send_business_notification(booking_dict)
            logger.info(f"Confirmation emails sent for booking {booking.bookingId}")
        except Exception as e:
            logger.error(f"Failed to send emails for booking {booking.bookingId}: {str(e)}")
        
        return booking
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create booking")

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(skip: int = 0, limit: int = 50):
    """Get all bookings with pagination"""
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters")
    
    try:
        bookings = await db.bookings.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
        
        # Convert ISO string timestamps back to datetime objects
        for booking in bookings:
            if isinstance(booking.get('createdAt'), str):
                booking['createdAt'] = datetime.fromisoformat(booking['createdAt'])
            if isinstance(booking.get('updatedAt'), str):
                booking['updatedAt'] = datetime.fromisoformat(booking['updatedAt'])
        
        return bookings
    except Exception as e:
        logger.error(f"Error fetching bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    """Get a specific booking by ID"""
    try:
        booking = await db.bookings.find_one({"bookingId": booking_id}, {"_id": 0})
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Convert ISO string timestamps back to datetime objects
        if isinstance(booking.get('createdAt'), str):
            booking['createdAt'] = datetime.fromisoformat(booking['createdAt'])
        if isinstance(booking.get('updatedAt'), str):
            booking['updatedAt'] = datetime.fromisoformat(booking['updatedAt'])
        
        return booking
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching booking {booking_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking")

@api_router.put("/bookings/{booking_id}/status", response_model=Booking)
async def update_booking_status(booking_id: str, status_update: dict):
    """Update booking status"""
    # Validate status value
    valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
    status_value = status_update.get('status', '').lower().strip()
    
    if not status_value or status_value not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        result = await db.bookings.find_one_and_update(
            {"bookingId": booking_id},
            {"$set": {"status": status_value, "updatedAt": datetime.utcnow().isoformat()}},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        logger.info(f"Booking {booking_id} status updated to {status_value}")
        
        # Convert ISO string timestamps back to datetime objects
        if isinstance(result.get('createdAt'), str):
            result['createdAt'] = datetime.fromisoformat(result['createdAt'])
        if isinstance(result.get('updatedAt'), str):
            result['updatedAt'] = datetime.fromisoformat(result['updatedAt'])
        
        return Booking(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking {booking_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update booking")

# New endpoint for sending custom messages
class MessageRequest(BaseModel):
    to_email: str
    to_name: str
    subject: str
    message: str
    customer_id: Optional[str] = None

@api_router.post("/send-message")
async def send_custom_message(message_req: MessageRequest):
    """Send a custom message to a customer"""
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
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal;">{message_req.subject}</h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px;">
                <p style="font-size: 16px; color: #333333; margin: 0 0 24px 0; line-height: 1.5;">
                    Dear {message_req.to_name},
                </p>
                
                {f'<div style="background-color: #f8f9fa; padding: 16px; margin: 0 0 24px 0; border-left: 3px solid #2563eb;"><p style="margin: 0 0 6px 0; color: #666666; font-size: 13px; text-transform: uppercase;">Customer ID</p><p style="margin: 0; color: #2563eb; font-size: 18px; font-weight: bold; font-family: monospace;">{message_req.customer_id}</p></div>' if message_req.customer_id else ''}
                
                <div style="margin: 0 0 30px 0;">
                    <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{message_req.message}</p>
                </div>
                
                <!-- Contact Info -->
                <div style="padding: 20px 0; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 14px; color: #555555; margin: 0 0 8px 0;">
                        Questions? Contact us:
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
    
    success = await email_service.send_email(message_req.to_email, message_req.subject, html_content)
    
    if success:
        return {"success": True, "message": "Email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

# Email campaign endpoints (for testing)
@api_router.post("/campaigns/trigger")
async def trigger_campaign(campaign_type: str = "monday"):
    """Manually trigger an email campaign for testing"""
    try:
        from email_campaign import send_weekly_campaign
        
        if campaign_type not in ['monday', 'friday']:
            raise HTTPException(status_code=400, detail="Invalid campaign type. Use 'monday' or 'friday'")
        
        # Run campaign in background
        import asyncio
        asyncio.create_task(send_weekly_campaign(campaign_type))
        
        return {
            "success": True, 
            "message": f"{campaign_type.capitalize()} campaign triggered successfully"
        }
    except Exception as e:
        logger.error(f"Error triggering campaign: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to trigger campaign")

@api_router.get("/campaigns/status")
async def get_campaign_status():
    """Get scheduled campaigns status"""
    jobs = scheduler.get_jobs()
    campaign_jobs = [
        {
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None
        }
        for job in jobs if 'campaign' in job.id
    ]
    return {"campaigns": campaign_jobs}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Schedule email campaigns
from email_campaign import run_monday_campaign, run_friday_campaign

# Monday morning campaign - 9:00 AM every Monday
scheduler.add_job(
    run_monday_campaign,
    CronTrigger(day_of_week='mon', hour=9, minute=0),
    id='monday_campaign',
    name='Monday Morning Email Campaign',
    replace_existing=True
)

# Friday morning campaign - 9:00 AM every Friday
scheduler.add_job(
    run_friday_campaign,
    CronTrigger(day_of_week='fri', hour=9, minute=0),
    id='friday_campaign',
    name='Friday Morning Email Campaign',
    replace_existing=True
)

logger.info("Email campaigns scheduled: Monday & Friday at 9:00 AM")

@app.on_event("shutdown")
async def shutdown_db_client():
    scheduler.shutdown()
    client.close()