# Pure Gold Solutions - API Contracts & Implementation Guide

## Overview
Full-stack booking system for car and home cleaning services with database persistence and email notifications.

## Mock Data Location
- Frontend: `/app/frontend/src/mock.js`
- Mock functions: `saveBooking()`, `getBookings()` using localStorage
- **TO REMOVE**: All localStorage logic after backend integration

## Database Schema

### Bookings Collection
```javascript
{
  _id: ObjectId,
  bookingId: String (UUID),
  name: String (required),
  email: String (optional),
  phone: String (required),
  address: String (required),
  service: String (required), // service ID from services
  serviceName: String, // service title for reference
  vehicleType: String (optional),
  date: Date (required),
  time: String (required),
  notes: String (optional),
  status: String (enum: ['pending', 'confirmed', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### POST /api/bookings
Create new booking
- **Request Body**: 
  ```json
  {
    "name": "string",
    "email": "string?",
    "phone": "string",
    "address": "string",
    "service": "string",
    "vehicleType": "string?",
    "date": "YYYY-MM-DD",
    "time": "HH:MM AM/PM",
    "notes": "string?"
  }
  ```
- **Response**: Created booking object with bookingId
- **Actions**: 
  1. Validate required fields
  2. Get service details from services array
  3. Save to MongoDB
  4. Send confirmation email to customer
  5. Send notification email to business

### GET /api/bookings
Get all bookings (for admin/future use)
- **Response**: Array of booking objects

### GET /api/bookings/:id
Get single booking by bookingId
- **Response**: Booking object

## Email Notifications

### Customer Confirmation Email
- **To**: Customer email (if provided)
- **Subject**: "Booking Confirmed - Pure Gold Solutions"
- **Content**:
  - Booking confirmation number
  - Service details
  - Date and time
  - Address
  - Payment info (payment after service)
  - Contact information

### Business Notification Email
- **To**: info@puregoldsolutions.ca (configured in env)
- **Subject**: "New Booking Received - [Service Name]"
- **Content**:
  - All booking details
  - Customer information
  - Service requested
  - Date, time, location

## Frontend Integration

### Files to Update:
1. **BookingForm.jsx**
   - Remove: `saveBooking()` import and localStorage logic
   - Add: axios POST to `/api/bookings`
   - Update: Success toast with booking ID
   - Add: Error handling for API failures

### Implementation Steps:
1. Replace mock `saveBooking()` call with API call
2. Show booking confirmation number in toast
3. Handle loading states
4. Handle API errors gracefully

## Environment Variables

### Backend (.env)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BUSINESS_EMAIL=info@puregoldsolutions.ca
```

## Implementation Checklist

### Backend:
- [ ] Create Booking model with Pydantic
- [ ] Implement POST /api/bookings endpoint
- [ ] Implement GET /api/bookings endpoints
- [ ] Add email service utility
- [ ] Configure SMTP settings
- [ ] Test email sending

### Frontend:
- [ ] Update BookingForm to use API
- [ ] Remove localStorage mock logic
- [ ] Add loading states
- [ ] Improve error handling
- [ ] Test booking flow end-to-end

## Testing Protocol
1. Test booking creation with all required fields
2. Test booking creation with optional fields
3. Verify email delivery (customer + business)
4. Test validation errors
5. Test database persistence
6. Verify booking retrieval
