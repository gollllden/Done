#!/usr/bin/env python3
"""
Backend API Testing Suite for Golden Touch Cleaning Service
Tests all critical backend endpoints with realistic data
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
import sys

# Backend URL from environment
BACKEND_URL = "https://homecarwash-portal.preview.emergentagent.com/api"
ADMIN_PASSWORD = "Amasarpong2006"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Backend-Test-Suite/1.0'
        })
        self.test_results = []
        
    def log_test(self, test_name, success, details="", error=""):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()
    
    def test_status_endpoints(self):
        """Test GET and POST /api/status endpoints"""
        print("=== Testing Status Endpoints ===")
        
        # Test GET /api/status
        try:
            response = self.session.get(f"{BACKEND_URL}/status")
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "GET /api/status", 
                    True, 
                    f"Retrieved {len(data)} status checks"
                )
            else:
                self.log_test(
                    "GET /api/status", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("GET /api/status", False, "", str(e))
        
        # Test POST /api/status
        try:
            test_data = {
                "client_name": "Golden Touch Test Client"
            }
            response = self.session.post(f"{BACKEND_URL}/status", json=test_data)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "POST /api/status", 
                    True, 
                    f"Created status check with ID: {data.get('id', 'N/A')}"
                )
            else:
                self.log_test(
                    "POST /api/status", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("POST /api/status", False, "", str(e))
    
    def test_promo_code_validation(self):
        """Test POST /api/validate-promo endpoint"""
        print("=== Testing Promo Code Validation ===")
        
        # Test valid promo code GOLDY
        try:
            test_data = {"promoCode": "GOLDY"}
            response = self.session.post(f"{BACKEND_URL}/validate-promo", json=test_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('valid') and data.get('discount') == 30:
                    self.log_test(
                        "Valid promo code GOLDY", 
                        True, 
                        f"Discount: {data.get('discount')}%, Message: {data.get('message')}"
                    )
                else:
                    self.log_test(
                        "Valid promo code GOLDY", 
                        False, 
                        f"Unexpected response: {data}"
                    )
            else:
                self.log_test(
                    "Valid promo code GOLDY", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Valid promo code GOLDY", False, "", str(e))
        
        # Test invalid promo code
        try:
            test_data = {"promoCode": "INVALID123"}
            response = self.session.post(f"{BACKEND_URL}/validate-promo", json=test_data)
            if response.status_code == 200:
                data = response.json()
                if not data.get('valid') and data.get('discount') == 0:
                    self.log_test(
                        "Invalid promo code", 
                        True, 
                        f"Correctly rejected invalid code: {data.get('message')}"
                    )
                else:
                    self.log_test(
                        "Invalid promo code", 
                        False, 
                        f"Should have rejected invalid code: {data}"
                    )
            else:
                self.log_test(
                    "Invalid promo code", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Invalid promo code", False, "", str(e))
    
    def test_admin_login(self):
        """Test POST /api/admin/login endpoint"""
        print("=== Testing Admin Login ===")
        
        # Test valid admin login
        try:
            test_data = {"password": ADMIN_PASSWORD}
            response = self.session.post(f"{BACKEND_URL}/admin/login", json=test_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.log_test(
                        "Valid admin login", 
                        True, 
                        f"Login successful, token received: {data.get('token')[:20]}..."
                    )
                    return data.get('token')  # Return token for potential future use
                else:
                    self.log_test(
                        "Valid admin login", 
                        False, 
                        f"Login failed: {data}"
                    )
            else:
                self.log_test(
                    "Valid admin login", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Valid admin login", False, "", str(e))
        
        # Test invalid admin login
        try:
            test_data = {"password": "wrongpassword123"}
            response = self.session.post(f"{BACKEND_URL}/admin/login", json=test_data)
            if response.status_code == 401:
                self.log_test(
                    "Invalid admin login", 
                    True, 
                    "Correctly rejected invalid password with 401"
                )
            else:
                self.log_test(
                    "Invalid admin login", 
                    False, 
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Invalid admin login", False, "", str(e))
        
        return None
    
    def test_booking_creation(self):
        """Test POST /api/bookings endpoint with comprehensive validation"""
        print("=== Testing Booking Creation ===")
        
        # Test valid booking creation
        try:
            # Create realistic booking data
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            test_booking = {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@email.com",
                "phone": "(403) 555-0123",
                "address": "1234 Maple Street NW, Calgary, AB T2N 1N4",
                "service": "3",  # Premium Full Detail
                "vehicleType": "SUV",
                "date": tomorrow,
                "time": "10:00 AM",
                "notes": "Please focus on interior cleaning, pet hair removal needed",
                "promoCode": "GOLDY"
            }
            
            response = self.session.post(f"{BACKEND_URL}/bookings", json=test_booking)
            if response.status_code == 200:
                data = response.json()
                required_fields = ['bookingId', 'customerId', 'name', 'phone', 'address', 'service', 'date', 'time']
                missing_fields = [field for field in required_fields if not data.get(field)]
                
                if not missing_fields:
                    self.log_test(
                        "Valid booking creation", 
                        True, 
                        f"Booking created - ID: {data.get('bookingId')}, Customer: {data.get('customerId')}, Service: {data.get('serviceName')}, Discount: {data.get('discount')}%"
                    )
                else:
                    self.log_test(
                        "Valid booking creation", 
                        False, 
                        f"Missing required fields: {missing_fields}"
                    )
            else:
                self.log_test(
                    "Valid booking creation", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Valid booking creation", False, "", str(e))
        
        # Test booking with missing required fields
        try:
            invalid_booking = {
                "name": "John Doe",
                # Missing phone, address, service, date, time
            }
            
            response = self.session.post(f"{BACKEND_URL}/bookings", json=invalid_booking)
            if response.status_code == 400 or response.status_code == 422:
                self.log_test(
                    "Invalid booking (missing fields)", 
                    True, 
                    f"Correctly rejected incomplete booking with status {response.status_code}"
                )
            else:
                self.log_test(
                    "Invalid booking (missing fields)", 
                    False, 
                    f"Should have rejected incomplete booking, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Invalid booking (missing fields)", False, "", str(e))
        
        # Test booking without promo code
        try:
            tomorrow = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
            booking_no_promo = {
                "name": "Michael Chen",
                "email": "michael.chen@email.com",
                "phone": "(403) 555-0456",
                "address": "5678 Oak Avenue SW, Calgary, AB T2S 2S8",
                "service": "5",  # House Cleaning Service
                "date": tomorrow,
                "time": "2:00 PM",
                "notes": "First time customer, 3 bedroom house"
            }
            
            response = self.session.post(f"{BACKEND_URL}/bookings", json=booking_no_promo)
            if response.status_code == 200:
                data = response.json()
                if data.get('discount') == 0 and not data.get('promoCode'):
                    self.log_test(
                        "Booking without promo code", 
                        True, 
                        f"Booking created without promo - ID: {data.get('bookingId')}, Service: {data.get('serviceName')}"
                    )
                else:
                    self.log_test(
                        "Booking without promo code", 
                        False, 
                        f"Unexpected promo data: discount={data.get('discount')}, promoCode={data.get('promoCode')}"
                    )
            else:
                self.log_test(
                    "Booking without promo code", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Booking without promo code", False, "", str(e))
    
    def test_email_campaigns(self):
        """Test POST /api/campaigns/trigger endpoint"""
        print("=== Testing Email Campaign Triggers ===")
        
        # Test Monday campaign trigger
        try:
            response = self.session.post(f"{BACKEND_URL}/campaigns/trigger?campaign_type=monday")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "Monday campaign trigger", 
                        True, 
                        data.get('message', 'Campaign triggered successfully')
                    )
                else:
                    self.log_test(
                        "Monday campaign trigger", 
                        False, 
                        f"Campaign trigger failed: {data}"
                    )
            else:
                self.log_test(
                    "Monday campaign trigger", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Monday campaign trigger", False, "", str(e))
        
        # Test Friday campaign trigger
        try:
            response = self.session.post(f"{BACKEND_URL}/campaigns/trigger?campaign_type=friday")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "Friday campaign trigger", 
                        True, 
                        data.get('message', 'Campaign triggered successfully')
                    )
                else:
                    self.log_test(
                        "Friday campaign trigger", 
                        False, 
                        f"Campaign trigger failed: {data}"
                    )
            else:
                self.log_test(
                    "Friday campaign trigger", 
                    False, 
                    f"Status code: {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Friday campaign trigger", False, "", str(e))
        
        # Test invalid campaign type
        try:
            response = self.session.post(f"{BACKEND_URL}/campaigns/trigger?campaign_type=invalid")
            if response.status_code == 400:
                self.log_test(
                    "Invalid campaign type", 
                    True, 
                    "Correctly rejected invalid campaign type with 400"
                )
            else:
                self.log_test(
                    "Invalid campaign type", 
                    False, 
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test("Invalid campaign type", False, "", str(e))
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Golden Touch Cleaning Backend API Tests")
        print(f"🔗 Testing against: {BACKEND_URL}")
        print("=" * 60)
        
        # Run all test suites
        self.test_status_endpoints()
        self.test_promo_code_validation()
        self.test_admin_login()
        self.test_booking_creation()
        self.test_email_campaigns()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['error']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)