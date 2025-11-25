"""
Security middleware and utilities for the application
"""
import os
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
import logging
import re

logger = logging.getLogger(__name__)

# Rate limiting storage
rate_limit_storage = defaultdict(list)
login_attempts = defaultdict(list)
blocked_ips = {}

# Security configurations
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW = 300  # 5 minutes
BLOCK_DURATION = 900  # 15 minutes
RATE_LIMIT_REQUESTS = 100  # requests per window
RATE_LIMIT_WINDOW = 60  # 1 minute


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(32)


def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS and injection attacks"""
    if not text:
        return text
    
    # Remove potentially dangerous characters and patterns
    text = re.sub(r'[<>"\']', '', text)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    return text.strip()


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate phone format"""
    # Remove common formatting characters
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    # Check if it's a valid phone number (10-15 digits)
    return bool(re.match(r'^\+?[1-9]\d{9,14}$', cleaned))


def check_ip_blocked(ip: str) -> bool:
    """Check if IP is blocked"""
    if ip in blocked_ips:
        if time.time() < blocked_ips[ip]:
            return True
        else:
            # Block expired, remove it
            del blocked_ips[ip]
    return False


def block_ip(ip: str):
    """Block IP address for specified duration"""
    blocked_ips[ip] = time.time() + BLOCK_DURATION
    logger.warning(f"IP {ip} has been blocked for {BLOCK_DURATION} seconds")


def check_rate_limit(ip: str) -> bool:
    """Check if IP has exceeded rate limit"""
    current_time = time.time()
    
    # Clean old entries
    rate_limit_storage[ip] = [
        req_time for req_time in rate_limit_storage[ip]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Check if exceeded
    if len(rate_limit_storage[ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limit_storage[ip].append(current_time)
    return True


def record_login_attempt(ip: str, success: bool) -> bool:
    """
    Record login attempt and check for brute force
    Returns True if login should be allowed, False if blocked
    """
    current_time = time.time()
    
    # Clean old attempts
    login_attempts[ip] = [
        (attempt_time, attempt_success) 
        for attempt_time, attempt_success in login_attempts[ip]
        if current_time - attempt_time < LOGIN_ATTEMPT_WINDOW
    ]
    
    # Add current attempt
    login_attempts[ip].append((current_time, success))
    
    # Count failed attempts in window
    failed_attempts = sum(
        1 for _, attempt_success in login_attempts[ip]
        if not attempt_success
    )
    
    # Block if too many failed attempts
    if failed_attempts >= MAX_LOGIN_ATTEMPTS:
        block_ip(ip)
        logger.warning(f"IP {ip} blocked due to {failed_attempts} failed login attempts")
        return False
    
    return True


async def rate_limit_middleware(request: Request, call_next):
    """Middleware for rate limiting"""
    client_ip = request.client.host
    
    # Check if IP is blocked
    if check_ip_blocked(client_ip):
        logger.warning(f"Blocked IP {client_ip} attempted to access {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Your IP has been temporarily blocked."}
        )
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        logger.warning(f"IP {client_ip} exceeded rate limit")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    
    response = await call_next(request)
    return response


def validate_booking_input(booking_data: dict) -> tuple[bool, str]:
    """Validate booking input data"""
    
    # Required fields
    required_fields = ['name', 'phone', 'address', 'service', 'date', 'time']
    for field in required_fields:
        if field not in booking_data or not booking_data[field]:
            return False, f"Missing required field: {field}"
    
    # Validate email if provided
    if booking_data.get('email'):
        if not validate_email(booking_data['email']):
            return False, "Invalid email format"
    
    # Validate phone
    if not validate_phone(booking_data['phone']):
        return False, "Invalid phone number format"
    
    # Sanitize text inputs
    text_fields = ['name', 'address', 'notes']
    for field in text_fields:
        if field in booking_data and booking_data[field]:
            booking_data[field] = sanitize_input(booking_data[field])
    
    # Validate date format
    try:
        datetime.strptime(booking_data['date'], '%Y-%m-%d')
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"
    
    # Check if date is not in the past
    booking_date = datetime.strptime(booking_data['date'], '%Y-%m-%d').date()
    if booking_date < datetime.now().date():
        return False, "Cannot book dates in the past"
    
    return True, "Valid"


def add_security_headers(response):
    """Add security headers to response"""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response


# Session management
active_sessions = {}
SESSION_TIMEOUT = 3600  # 1 hour


def create_session(user_id: str) -> str:
    """Create a new session"""
    token = generate_session_token()
    active_sessions[token] = {
        'user_id': user_id,
        'created_at': datetime.now(),
        'last_activity': datetime.now()
    }
    return token


def validate_session(token: str) -> bool:
    """Validate session token"""
    if token not in active_sessions:
        return False
    
    session = active_sessions[token]
    
    # Check if session expired
    if (datetime.now() - session['last_activity']).seconds > SESSION_TIMEOUT:
        del active_sessions[token]
        return False
    
    # Update last activity
    session['last_activity'] = datetime.now()
    return True


def invalidate_session(token: str):
    """Invalidate session (logout)"""
    if token in active_sessions:
        del active_sessions[token]


def clean_expired_sessions():
    """Clean expired sessions"""
    current_time = datetime.now()
    expired = [
        token for token, session in active_sessions.items()
        if (current_time - session['last_activity']).seconds > SESSION_TIMEOUT
    ]
    
    for token in expired:
        del active_sessions[token]
    
    if expired:
        logger.info(f"Cleaned {len(expired)} expired sessions")
