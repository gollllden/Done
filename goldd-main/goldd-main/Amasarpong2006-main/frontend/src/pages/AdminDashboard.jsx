import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Users, CheckCircle, Clock, LogOut, Search, Phone, Mail, MapPin, Car, Bell, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import EmailModal from '../components/EmailModal';
import BookingCalendar from '../components/BookingCalendar';
import BookedTimesList from '../components/BookedTimesList';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [lastBookingCount, setLastBookingCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchBookings();
    // Poll for new bookings every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      const newBookings = response.data;
      
      // Check for new bookings
      if (lastBookingCount > 0 && newBookings.length > lastBookingCount) {
        const newBookingsCount = newBookings.length - lastBookingCount;
        setShowNotification(true);
        toast({
          title: '🔔 New Booking Alert!',
          description: `You have ${newBookingsCount} new booking${newBookingsCount > 1 ? 's' : ''}!`,
        });
        // Play notification sound (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Golden Touch Cleaning Services', {
            body: `New booking received!`,
            icon: 'https://customer-assets.emergentagent.com/job_puregold-carwash/artifacts/iusyof5u_pure%20gold.jpg'
          });
        }
      }
      
      setLastBookingCount(newBookings.length);
      setBookings(newBookings);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone.includes(searchTerm) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status`, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${newStatus}`,
      });
      fetchBookings();
      if (selectedBooking && selectedBooking.bookingId === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_puregold-carwash/artifacts/tbkzsfdv_1000237724.jpg" 
                alt="Golden Touch Cleaning Services"
                className="h-16 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Golden Touch Cleaning Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {showNotification && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-blue-600 animate-bounce" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    !
                  </span>
                </div>
              )}
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="hidden md:flex"
              >
                View Website
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, phone, email, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="list" className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="schedule">Booked Times</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Bookings ({filteredBookings.length})
                </h2>
            {filteredBookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card 
                  key={booking.bookingId} 
                  className={`border-0 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                    selectedBooking?.bookingId === booking.bookingId ? 'ring-2 ring-blue-600' : ''
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{booking.name}</h3>
                        <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        {booking.customerId && (
                          <p className="text-xs font-mono text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                            ID: {booking.customerId}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {booking.date} at {booking.time}</p>
                      <p>📞 {booking.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Booking Details */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selectedBooking ? (
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardTitle className="text-2xl">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Customer Information</h4>
                      <Button 
                        size="sm"
                        onClick={() => setEmailModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                    
                    {/* Customer ID Badge */}
                    {selectedBooking.customerId && (
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg mb-4 text-center">
                        <p className="text-xs uppercase tracking-wider opacity-90 mb-1">Customer ID</p>
                        <p className="text-2xl font-bold font-mono tracking-wider">{selectedBooking.customerId}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{selectedBooking.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <a href={`tel:${selectedBooking.phone}`} className="hover:text-blue-600">{selectedBooking.phone}</a>
                      </div>
                      {selectedBooking.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a href={`mailto:${selectedBooking.email}`} className="hover:text-blue-600">{selectedBooking.email}</a>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                        <span>{selectedBooking.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span>{selectedBooking.serviceName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{selectedBooking.date} at {selectedBooking.time}</span>
                      </div>
                      {selectedBooking.notes && (
                        <div className="text-gray-700">
                          <span className="font-medium">Notes:</span> {selectedBooking.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => updateBookingStatus(selectedBooking.bookingId, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={selectedBooking.status === 'confirmed'}
                      >
                        Confirm
                      </Button>
                      <Button 
                        onClick={() => updateBookingStatus(selectedBooking.bookingId, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={selectedBooking.status === 'completed'}
                      >
                        Complete
                      </Button>
                      <Button 
                        onClick={() => updateBookingStatus(selectedBooking.bookingId, 'pending')}
                        variant="outline"
                        disabled={selectedBooking.status === 'pending'}
                      >
                        Set Pending
                      </Button>
                      <Button 
                        onClick={() => updateBookingStatus(selectedBooking.bookingId, 'cancelled')}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        disabled={selectedBooking.status === 'cancelled'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Booking Meta */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Booking ID: {selectedBooking.bookingId}</p>
                      <p>Created: {format(new Date(selectedBooking.createdAt), 'PPpp')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select a booking to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <BookingCalendar 
              bookings={bookings} 
              onSelectEvent={setSelectedBooking}
            />
          </TabsContent>

          {/* Booked Times List View */}
          <TabsContent value="schedule">
            <BookedTimesList 
              bookings={bookings}
              onSelectBooking={setSelectedBooking}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Modal */}
      {selectedBooking && (
        <EmailModal 
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          customer={selectedBooking}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
