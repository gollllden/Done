#!/usr/bin/env python3
"""
Backend API Testing for Pure Gold Solutions Booking System
Tests all booking-related endpoints and functionality
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime
import os
from pathlib import Path

# Load environment variables to get the correct backend URL
sys.path.append('/app/frontend')
from dotenv import load_dotenv

# Load frontend .env to get the backend URL
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class BookingAPITester:
    def __init__(self):
        self.session = None
        self.test_booking_id = None
        self.test_results = []
        
    async def setup(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def teardown(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
    
    async def test_health_check(self):
        """Test 1: Health Check - GET /api/"""
        try:
            async with self.session.get(f"{API_BASE_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('message') == 'Hello World':
                        self.log_result("Health Check", True, "Server is running and responding correctly")
                        return True
                    else:
                        self.log_result("Health Check", False, f"Unexpected response: {data}")
                        return False
                else:
                    self.log_result("Health Check", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    async def test_create_car_booking(self):
        """Test 2: Create Booking - Car Service"""
        booking_data = {
            "name": "John Test",
            "email": "john@test.com",
            "phone": "(403) 555-1111",
            "address": "123 Test St NW, Calgary, AB",
            "service": "1",
            "vehicleType": "sedan",
            "date": "2025-08-15",
            "time": "10:00 AM",
            "notes": "Please call before arriving"
        }
        
        try:
            async with self.session.post(
                f"{API_BASE_URL}/bookings",
                json=booking_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify required fields
                    if 'bookingId' in data and data.get('status') == 'pending':
                        self.test_booking_id = data['bookingId']  # Save for later tests
                        
                        # Verify service name mapping
                        if data.get('serviceName') == 'Exterior Wash & Wax':
                            self.log_result("Create Car Booking", True, 
                                          f"Booking created successfully with ID: {self.test_booking_id}")
                            return True
                        else:
                            self.log_result("Create Car Booking", False, 
                                          f"Service name mapping failed: {data.get('serviceName')}")
                            return False
                    else:
                        self.log_result("Create Car Booking", False, 
                                      f"Missing bookingId or incorrect status: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Create Car Booking", False, 
                                  f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Create Car Booking", False, f"Request error: {str(e)}")
            return False
    
    async def test_create_home_booking(self):
        """Test 3: Create Booking - Home Service (without optional fields)"""
        booking_data = {
            "name": "Sarah Home",
            "phone": "(403) 555-2222",
            "address": "456 Home Ave SW, Calgary, AB",
            "service": "5",
            "date": "2025-08-16",
            "time": "2:00 PM"
        }
        
        try:
            async with self.session.post(
                f"{API_BASE_URL}/bookings",
                json=booking_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify required fields and service mapping
                    if ('bookingId' in data and 
                        data.get('status') == 'pending' and 
                        data.get('serviceName') == 'Home Cleaning'):
                        self.log_result("Create Home Booking", True, 
                                      f"Home booking created successfully without optional fields")
                        return True
                    else:
                        self.log_result("Create Home Booking", False, 
                                      f"Booking creation failed: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Create Home Booking", False, 
                                  f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Create Home Booking", False, f"Request error: {str(e)}")
            return False
    
    async def test_get_all_bookings(self):
        """Test 4: Get All Bookings"""
        try:
            async with self.session.get(f"{API_BASE_URL}/bookings") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if isinstance(data, list) and len(data) >= 2:
                        # Verify we have our test bookings
                        booking_ids = [booking.get('bookingId') for booking in data]
                        if self.test_booking_id in booking_ids:
                            self.log_result("Get All Bookings", True, 
                                          f"Retrieved {len(data)} bookings including test booking")
                            return True
                        else:
                            self.log_result("Get All Bookings", False, 
                                          f"Test booking ID {self.test_booking_id} not found in results")
                            return False
                    else:
                        self.log_result("Get All Bookings", False, 
                                      f"Expected array with bookings, got: {type(data)} with {len(data) if isinstance(data, list) else 'N/A'} items")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Get All Bookings", False, 
                                  f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Get All Bookings", False, f"Request error: {str(e)}")
            return False
    
    async def test_get_single_booking(self):
        """Test 5: Get Single Booking"""
        if not self.test_booking_id:
            self.log_result("Get Single Booking", False, "No test booking ID available")
            return False
        
        try:
            async with self.session.get(f"{API_BASE_URL}/bookings/{self.test_booking_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify booking details
                    if (data.get('bookingId') == self.test_booking_id and
                        data.get('name') == 'John Test' and
                        data.get('serviceName') == 'Exterior Wash & Wax'):
                        self.log_result("Get Single Booking", True, 
                                      f"Retrieved correct booking details for ID: {self.test_booking_id}")
                        return True
                    else:
                        self.log_result("Get Single Booking", False, 
                                      f"Booking details don't match expected values: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Get Single Booking", False, 
                                  f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Get Single Booking", False, f"Request error: {str(e)}")
            return False
    
    async def test_update_booking_status(self):
        """Test 6: Update Booking Status"""
        if not self.test_booking_id:
            self.log_result("Update Booking Status", False, "No test booking ID available")
            return False
        
        try:
            # Note: The API expects status as a query parameter or in request body
            # Let me check the actual implementation - it seems to expect status as a parameter
            async with self.session.put(
                f"{API_BASE_URL}/bookings/{self.test_booking_id}/status",
                json={"status": "confirmed"},
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get('status') == 'confirmed':
                        # Verify the status was actually updated by fetching the booking
                        async with self.session.get(f"{API_BASE_URL}/bookings/{self.test_booking_id}") as verify_response:
                            if verify_response.status == 200:
                                verify_data = await verify_response.json()
                                if verify_data.get('status') == 'confirmed':
                                    self.log_result("Update Booking Status", True, 
                                                  f"Status updated to 'confirmed' successfully")
                                    return True
                                else:
                                    self.log_result("Update Booking Status", False, 
                                                  f"Status update not persisted: {verify_data.get('status')}")
                                    return False
                    else:
                        self.log_result("Update Booking Status", False, 
                                      f"Unexpected response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_result("Update Booking Status", False, 
                                  f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_result("Update Booking Status", False, f"Request error: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test 7: Error Handling"""
        success_count = 0
        total_tests = 2
        
        # Test 7a: Missing required fields
        try:
            invalid_booking = {"name": "Test"}  # Missing required fields
            async with self.session.post(
                f"{API_BASE_URL}/bookings",
                json=invalid_booking,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 422:
                    self.log_result("Error Handling - Missing Fields", True, 
                                  "Correctly returned 422 for missing required fields")
                    success_count += 1
                else:
                    error_text = await response.text()
                    self.log_result("Error Handling - Missing Fields", False, 
                                  f"Expected 422, got {response.status}: {error_text}")
        except Exception as e:
            self.log_result("Error Handling - Missing Fields", False, f"Request error: {str(e)}")
        
        # Test 7b: Invalid booking ID
        try:
            async with self.session.get(f"{API_BASE_URL}/bookings/invalid-id") as response:
                if response.status == 404:
                    self.log_result("Error Handling - Invalid ID", True, 
                                  "Correctly returned 404 for invalid booking ID")
                    success_count += 1
                else:
                    error_text = await response.text()
                    self.log_result("Error Handling - Invalid ID", False, 
                                  f"Expected 404, got {response.status}: {error_text}")
        except Exception as e:
            self.log_result("Error Handling - Invalid ID", False, f"Request error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_email_service_status(self):
        """Test 8: Check Email Service Status"""
        # This is informational - we expect emails to be disabled in test environment
        try:
            # Check if SMTP credentials are configured in backend
            from pathlib import Path
            env_path = Path('/app/backend/.env')
            if env_path.exists():
                with open(env_path, 'r') as f:
                    env_content = f.read()
                    if 'SMTP_USER=' in env_content and 'SMTP_PASS=' in env_content:
                        # Check if they have actual values
                        lines = env_content.split('\n')
                        smtp_user = None
                        smtp_pass = None
                        for line in lines:
                            if line.startswith('SMTP_USER='):
                                smtp_user = line.split('=', 1)[1].strip()
                            elif line.startswith('SMTP_PASS='):
                                smtp_pass = line.split('=', 1)[1].strip()
                        
                        if smtp_user and smtp_pass:
                            self.log_result("Email Service Status", True, 
                                          "Email service is configured and should be working")
                        else:
                            self.log_result("Email Service Status", True, 
                                          "Email service is disabled (SMTP credentials not configured) - This is expected in test environment")
                    else:
                        self.log_result("Email Service Status", True, 
                                      "Email service is disabled (SMTP credentials not configured) - This is expected in test environment")
            else:
                self.log_result("Email Service Status", False, 
                              "Backend .env file not found")
        except Exception as e:
            self.log_result("Email Service Status", False, f"Error checking email config: {str(e)}")
        
        return True  # This test always passes as it's informational
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("PURE GOLD SOLUTIONS - BACKEND API TESTING")
        print("=" * 60)
        
        await self.setup()
        
        try:
            # Run tests in order
            tests = [
                self.test_health_check,
                self.test_create_car_booking,
                self.test_create_home_booking,
                self.test_get_all_bookings,
                self.test_get_single_booking,
                self.test_update_booking_status,
                self.test_error_handling,
                self.test_email_service_status
            ]
            
            passed = 0
            total = len(tests)
            
            for test in tests:
                print("-" * 40)
                result = await test()
                if result:
                    passed += 1
                print()
            
            print("=" * 60)
            print(f"TEST SUMMARY: {passed}/{total} tests passed")
            print("=" * 60)
            
            # Print detailed results
            print("\nDETAILED RESULTS:")
            for result in self.test_results:
                status = "✅" if result['success'] else "❌"
                print(f"{status} {result['test']}: {result['message']}")
                if result['details']:
                    print(f"   {result['details']}")
            
            return passed == total
            
        finally:
            await self.teardown()

async def main():
    """Main test runner"""
    tester = BookingAPITester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the results above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)