import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Car, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { services } from '../mock';
import { format } from 'date-fns';
import axios from 'axios';
import ModernBookingCalendar from './ModernBookingCalendar';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addressInputRef = useRef(null);
  const { inputRef: placesInputRef, error: placesError } = usePlacesAutocomplete({
    countries: ['ca'],
    onPlaceSelected: (place) => {
      if (place && place.formatted_address) {
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address,
        }));
      }
    },
  });

  useEffect(() => {
    if (placesInputRef && placesInputRef.current && addressInputRef.current) {
      placesInputRef.current = addressInputRef.current;
    }
  }, [placesInputRef]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    date: '', // ISO date string: YYYY-MM-DD
    time: '',
    notes: '',
    promoCode: ''
  });
  const [promoStatus, setPromoStatus] = useState({ valid: false, discount: 0, message: '' });
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState(null);

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      date: slot.date,
      time: slot.time,
    }));
    setSelectedSlotInfo({
      dateDisplay: slot.dateDisplay,
      timeSlot: slot.timeSlot,
    });
  };

  const validatePromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setPromoStatus({ valid: false, discount: 0, message: '' });
      return;
    }

    setCheckingPromo(true);
    try {
      const response = await axios.post(`${API}/validate-promo`, {
        promoCode: formData.promoCode
      });
      
      setPromoStatus(response.data);
      
      if (response.data.valid) {
        toast({
          title: '✓ Promo Code Applied!',
          description: response.data.message,
        });
      } else {
        toast({
          title: 'Invalid Promo Code',
          description: response.data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoStatus({ valid: false, discount: 0, message: 'Error validating promo code' });
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.address || !formData.service || !formData.date || !formData.time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and choose a date and time from the calendar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
      };

      const response = await axios.post(`${API}/bookings`, bookingData);

      const displayDate = selectedSlotInfo?.dateDisplay || (formData.date ? format(new Date(formData.date), 'PPP') : formData.date);
      const displayTime = selectedSlotInfo?.timeSlot || formData.time;

      toast({
        title: 'Booking Confirmed!',
        description: `Your appointment has been scheduled for ${displayDate} at ${displayTime}. Booking ID: ${response.data.bookingId}. We'll contact you shortly to confirm.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        service: '',
        date: '',
        time: '',
        notes: '',
        promoCode: '',
      });
      setSelectedSlotInfo(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description:
          error.response?.data?.detail || 'Failed to submit booking. Please try again or call us directly at (403) 555-0123.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSummary = () => {
    if (!formData.date || !formData.time) return null;
    const displayDate = selectedSlotInfo?.dateDisplay || (formData.date ? format(new Date(formData.date), 'PPP') : formData.date);
    const displayTime = selectedSlotInfo?.timeSlot || formData.time;

    return `${displayDate} • ${displayTime}`;
  };

  return (
    <section id="booking" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book Your Service</h2>
            <p className="text-xl text-gray-600">Schedule your car detailing or home cleaning service in Calgary</p>
          </div>

          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8">
              <CardTitle className="text-3xl font-bold">Service Booking</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Choose your preferred date and time on the calendar, then share a few details so we can confirm your appointment.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left column: Customer details */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Full Name *</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Lilian Asamoah"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>Phone Number *</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(403) 555-0123"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Email Address</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="goldentouchcleaningservice25@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Service Address in Calgary *</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="123 Main St NW, Calgary, AB"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        ref={addressInputRef}
                        required
                      />
                      {placesError && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Address suggestions are temporarily unavailable. You can still type your address manually.
                        </p>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-2">
                      <Label htmlFor="service" className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span>Select Service *</span>
                      </Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => setFormData({ ...formData, service: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title} - {service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Promo Code */}
                    <div className="space-y-2">
                      <Label htmlFor="promoCode" className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Promo Code</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="promoCode"
                          placeholder="Enter promo code"
                          value={formData.promoCode}
                          onChange={(e) => {
                            setFormData({ ...formData, promoCode: e.target.value });
                            setPromoStatus({ valid: false, discount: 0, message: '' });
                          }}
                          className={promoStatus.valid ? 'border-green-500' : ''}
                        />
                        <Button
                          type="button"
                          onClick={validatePromoCode}
                          disabled={checkingPromo || !formData.promoCode.trim()}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          {checkingPromo ? 'Checking...' : 'Apply'}
                        </Button>
                      </div>
                      {promoStatus.message && (
                        <p className={`text-sm ${promoStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
                          {promoStatus.message}
                        </p>
                      )}
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>Additional Details for Our Team</span>
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Please share any special requests, parking instructions, building access details, or other information that will help our team serve you better."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Right column: Modern calendar & time slots */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-50 text-blue-700">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Choose Date & Time</p>
                          <p className="text-xs text-gray-500">
                            Select a slot that works best for you. Fully booked times are disabled.
                          </p>
                        </div>
                      </div>
                      {selectedSummary() && (
                        <div className="hidden lg:block text-right text-xs text-blue-50 max-w-[160px]">
                          <p className="uppercase tracking-wide opacity-80">Selected</p>
                          <p className="font-semibold leading-snug">{selectedSummary()}</p>
                        </div>
                      )}
                    </div>

                    <ModernBookingCalendar onSelectSlot={handleSlotSelect} />

                    <div className="text-xs text-gray-600 flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
                      {!formData.date || !formData.time ? (
                        <span>
                          Please select a <span className="font-semibold">date</span> and <span className="font-semibold">time slot</span> from the calendar to
                          complete your booking.
                        </span>
                      ) : (
                        <span>
                          You selected: <span className="font-semibold">{selectedSummary()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-7 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                <p className="text-sm text-gray-600 text-center">* Payment will be collected after service completion</p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Need help? Call us at{' '}
                  <a href="tel:6477875942" className="text-blue-600 hover:underline">
                    (647) 787-5942
                  </a>
                </p>
                <p className="text-xs text-gray-500 text-center mt-1" data-testid="no-email-help-link">
                  Didn't get any confirmation email?{' '}
                  <a href="/customer-portal" className="text-blue-600 hover:underline">
                    View your booking in the Customer Portal
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
