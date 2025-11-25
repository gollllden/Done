import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import moment from 'moment';

const BookedTimesList = ({ bookings, onSelectBooking }) => {
  const groupedBookings = useMemo(() => {
    const grouped = {};
    
    bookings
      .filter(b => b.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(booking => {
        if (!grouped[booking.date]) {
          grouped[booking.date] = [];
        }
        grouped[booking.date].push(booking);
      });
    
    return grouped;
  }, [bookings]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (date) => {
    return moment(date).isAfter(moment().subtract(1, 'day'));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Booked Days & Times</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {Object.keys(groupedBookings).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No bookings scheduled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([date, dateBookings]) => (
              <div key={date} className={`${isUpcoming(date) ? 'border-l-4 border-blue-600 pl-4' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">
                    {moment(date).format('dddd, MMMM D, YYYY')}
                  </h3>
                  {isUpcoming(date) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      Upcoming
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {dateBookings
                    .sort((a, b) => {
                      const timeA = moment(a.time, 'h:mm A');
                      const timeB = moment(b.time, 'h:mm A');
                      return timeA - timeB;
                    })
                    .map(booking => (
                      <div
                        key={booking.bookingId}
                        onClick={() => onSelectBooking(booking)}
                        className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-gray-900">{booking.time}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{booking.name}</span>
                          {booking.customerId && (
                            <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              {booking.customerId}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 ml-6">{booking.serviceName}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookedTimesList;
