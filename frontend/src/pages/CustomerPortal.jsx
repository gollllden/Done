import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { Search, Calendar, Clock, MapPin, FileText, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleSearch = async () => {
    if (!searchEmail && !searchPhone) {
      toast({
        title: 'Search Required',
        description: 'Please enter either email or phone number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await axios.get(`${API}/bookings`);
      const allBookings = response.data;
      
      // Filter bookings by email or phone
      const filtered = allBookings.filter(booking => {
        const emailMatch = searchEmail && booking.email && 
          booking.email.toLowerCase().includes(searchEmail.toLowerCase());
        const phoneMatch = searchPhone && booking.phone && 
          booking.phone.replace(/\D/g, '').includes(searchPhone.replace(/\D/g, ''));
        
        return emailMatch || phoneMatch;
      });

      setBookings(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      
      if (filtered.length === 0) {
        toast({
          title: 'No Bookings Found',
          description: 'No bookings found with the provided information',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: 'Unable to search bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (booking) => {
    // Generate simple text invoice
    const invoice = `
GOLDEN TOUCH CLEANING SERVICES
Invoice / Receipt

Customer ID: ${booking.customerId}
Booking ID: ${booking.bookingId}

-----------------------------------
CUSTOMER INFORMATION
-----------------------------------
Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email || 'N/A'}
Address: ${booking.address}

-----------------------------------
SERVICE DETAILS
-----------------------------------
Service: ${booking.serviceName}
Date: ${booking.date}
Time: ${booking.time}
${booking.vehicleType ? `Vehicle Type: ${booking.vehicleType}\n` : ''}
${booking.notes ? `Notes: ${booking.notes}\n` : ''}
${booking.promoCode ? `Promo Code: ${booking.promoCode} (${booking.discount}% discount)\n` : ''}

-----------------------------------
BOOKING STATUS
-----------------------------------
Status: ${booking.status.toUpperCase()}
Booked On: ${format(new Date(booking.createdAt), 'PPpp')}

-----------------------------------
CONTACT US
-----------------------------------
Phone: (647) 787-5942
Email: goldentouchcleaningservice25@gmail.com

Thank you for choosing Golden Touch Cleaning Services!
Calgary's Premier Mobile Cleaning Service
    `;

    // Create and download the file
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${booking.customerId}_${booking.bookingId.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Invoice Downloaded',
      description: 'Your invoice has been downloaded successfully',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Customer Portal</h1>
              <p className="text-blue-100 mt-1">View your bookings and download invoices</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search Section */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Search className="w-5 h-5" />
              Find Your Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
            >
              {loading ? 'Searching...' : 'Search My Bookings'}
            </Button>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Enter your email or phone number to view your booking history
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                  <p className="text-gray-600">
                    We couldn't find any bookings with the provided information.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Bookings ({bookings.length})
                  </h2>
                </div>
                
                {bookings.map((booking) => (
                  <Card key={booking.bookingId} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{booking.serviceName}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Customer ID: <span className="font-mono font-semibold">{booking.customerId}</span>
                              </p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{booking.address}</span>
                            </div>
                            {booking.vehicleType && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                <span className="text-sm">{booking.vehicleType}</span>
                              </div>
                            )}
                          </div>

                          {booking.promoCode && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-800">
                                <span className="font-semibold">Promo Applied:</span> {booking.promoCode} ({booking.discount}% discount)
                              </p>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Notes:</span> {booking.notes}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">
                            Booked on {format(new Date(booking.createdAt), 'PPpp')}
                          </p>
                        </div>

                        {/* Download Button */}
                        <div className="md:ml-6">
                          <Button
                            onClick={() => downloadInvoice(booking)}
                            variant="outline"
                            className="w-full md:w-auto whitespace-nowrap"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Help Section */}
        {!searched && (
          <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                Contact us for assistance with your bookings
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:6477875942" className="text-blue-700 hover:text-blue-900 font-semibold">
                  📞 (647) 787-5942
                </a>
                <span className="hidden sm:inline text-blue-400">|</span>
                <a href="mailto:goldentouchcleaningservice25@gmail.com" className="text-blue-700 hover:text-blue-900 font-semibold">
                  📧 goldentouchcleaningservice25@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
