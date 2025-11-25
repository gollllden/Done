import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import moment from 'moment';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ModernBookingCalendar = ({ onSelectSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedTimeId, setSelectedTimeId] = useState('');

  // Time slots configuration
  const timeSlots = [
    { id: '2', label: '8:00 am - 9:30 am', time: '8:00 AM', capacity: 7 },
    { id: '3', label: '10:30 am - 12:00 pm', time: '10:30 AM', capacity: 7 },
    { id: '4', label: '1:00 pm - 2:30 pm', time: '1:00 PM', capacity: 7 },
    { id: '5', label: '3:00 pm - 4:30 pm', time: '3:00 PM', capacity: 7 },
    { id: '6', label: '5:00 pm - 6:30 pm', time: '5:00 PM', capacity: 7 },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      calculateAvailability(selectedDate);
      setSelectedTimeId('');
    }
  }, [selectedDate, bookedSlots]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      const bookings = response.data;

      // Group bookings by date and time
      const grouped = {};
      bookings.forEach((booking) => {
        const key = `${booking.date}-${booking.time}`;
        grouped[key] = (grouped[key] || 0) + 1;
      });

      setBookedSlots(grouped);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const calculateAvailability = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const slots = timeSlots.map((slot) => {
      const key = `${dateStr}-${slot.time}`;
      const booked = bookedSlots[key] || 0;
      const available = slot.capacity - booked;

      return {
        ...slot,
        available,
        booked,
      };
    });

    setAvailableSlots(slots);
  };

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days = [];
    let day = startDate.clone();

    while (day.isBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const handleDateSelect = (date) => {
    if (date.isBefore(moment(), 'day')) return; // Don't allow past dates
    setSelectedDate(date);
  };

  const handleTimeChange = (slotId) => {
    setSelectedTimeId(slotId);
    const slot = availableSlots.find((s) => s.id === slotId);
    if (!slot || slot.available <= 0 || !selectedDate) return;

    onSelectSlot({
      date: selectedDate.format('YYYY-MM-DD'),
      time: slot.time,
      dateDisplay: selectedDate.format('MMMM D, YYYY'),
      timeSlot: slot.label,
    });
  };

  const days = getDaysInMonth();
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {currentMonth.format('MMMM YYYY').toUpperCase()}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="rounded-t-none border-0 shadow-2xl">
        <div className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-sm text-white bg-blue-900 py-2 rounded"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(moment(), 'day');
              const isSelected = selectedDate && day.isSame(selectedDate, 'day');
              const isPast = day.isBefore(moment(), 'day');

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={isPast}
                  className={`
                    aspect-square p-2 text-center rounded-lg font-medium text-lg
                    transition-all duration-200
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isPast ? 'cursor-not-allowed opacity-40' : 'hover:bg-blue-50 cursor-pointer'}
                    ${isToday ? 'ring-2 ring-blue-600 bg-blue-50' : ''}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  `}
                >
                  {day.format('D')}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Selected Date & Time dropdown */}
      {selectedDate && (
        <Card className="mt-6 border-0 shadow-xl">
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-center text-gray-900">
              {selectedDate.format('MMMM D, YYYY')}
            </h3>

            <div className="max-w-md mx-auto w-full space-y-2">
              <p className="text-sm font-medium text-gray-700">Select a time</p>
              <Select
                value={selectedTimeId}
                onValueChange={handleTimeChange}
                disabled={availableSlots.every((slot) => slot.available <= 0)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableSlots.every((slot) => slot.available <= 0)
                        ? 'No time slots available for this date'
                        : 'Choose a time slot'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem
                      key={slot.id}
                      value={slot.id}
                      disabled={slot.available <= 0}
                    >
                      {slot.label}{' '}
                      {slot.available <= 0
                        ? '(Fully booked)'
                        : `(${slot.available} spaces available)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModernBookingCalendar;
