from fastapi import FastAPI, APIRouter, HTTPException
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Services data (matching frontend)
SERVICES = {
    '1': 'Exterior Wash & Wax',
    '2': 'Interior Detailing',
    '3': 'Premium Full Detail',
    '4': 'Engine Bay Cleaning',
    '5': 'Home Cleaning',
    '6': 'Event Cleaning',
    '7': 'Contract Cleaning',
    '8': 'New Home Cleaning'
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

# Booking endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    """Create a new booking"""
    try:
        # Get service name from service ID
        service_name = SERVICES.get(booking_data.service, booking_data.service)
        
        # Create booking object
        booking = Booking(
            **booking_data.model_dump(),
            serviceName=service_name
        )
        
        # Convert to dict for MongoDB
        booking_dict = booking.model_dump()
        booking_dict['createdAt'] = booking_dict['createdAt'].isoformat()
        booking_dict['updatedAt'] = booking_dict['updatedAt'].isoformat()
        
        # Insert into database
        result = await db.bookings.insert_one(booking_dict)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create booking")
        
        # Send emails (non-blocking)
        try:
            await email_service.send_customer_confirmation(booking_dict)
            await email_service.send_business_notification(booking_dict)
        except Exception as e:
            logger.error(f"Failed to send emails for booking {booking.bookingId}: {str(e)}")
        
        return booking
        
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create booking")

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings():
    """Get all bookings"""
    try:
        bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
        
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
    result = await db.bookings.find_one_and_update(
        {"bookingId": booking_id},
        {"$set": {"status": status_update["status"], "updatedAt": datetime.utcnow()}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**result)

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
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header with Logo -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
                <img src="https://customer-assets.emergentagent.com/job_puregold-carwash/artifacts/tbkzsfdv_1000237724.jpg" alt="Golden Touch Cleaning Services" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">{message_req.subject}</h1>
                <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Golden Touch Cleaning Services</p>
            </div>
            
            <!-- Message Content -->
            <div style="padding: 40px 30px; background: #ffffff;">
                <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hi <strong>{message_req.to_name}</strong>,</p>
                
                {f'<div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 15px; border-radius: 8px; margin: 0 0 25px 0; text-align: center;"><p style="margin: 0; color: #bfdbfe; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Your Customer ID</p><p style="margin: 5px 0 0 0; color: #ffffff; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 2px;">{message_req.customer_id}</p></div>' if message_req.customer_id else ''}
                
                <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border-left: 4px solid #2563eb;">
                    <p style="color: #1f2937; font-size: 16px; line-height: 1.8; margin: 0; white-space: pre-wrap;">{message_req.message}</p>
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
    
    success = await email_service.send_email(message_req.to_email, message_req.subject, html_content)
    
    if success:
        return {"success": True, "message": "Email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()