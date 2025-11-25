from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class BookingCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    address: str
    service: str
    vehicleType: Optional[str] = None
    date: str
    time: str
    notes: Optional[str] = None
    promoCode: Optional[str] = None


import random
import string

def generate_customer_id():
    """Generate a unique 8-character customer ID like GT-ABC123"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    numbers = ''.join(random.choices(string.digits, k=3))
    return f"GT-{letters}{numbers}"

class Booking(BaseModel):
    bookingId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customerId: str = Field(default_factory=generate_customer_id)
    name: str
    email: Optional[str] = None
    phone: str
    address: str
    service: str
    serviceName: str
    vehicleType: Optional[str] = None
    date: str
    time: str
    notes: Optional[str] = None
    promoCode: Optional[str] = None
    discount: int = Field(default=0)
    status: str = Field(default='pending')
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
