import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ bookings, onSelectEvent }) => {
  const events = useMemo(() => {
    return bookings.map(booking => {
      const [hours, minutes] = booking.time.split(':');
      const isPM = booking.time.includes('PM');
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      const startDate = moment(booking.date).hour(hour).minute(parseInt(minutes) || 0).toDate();
      const endDate = moment(startDate).add(2, 'hours').toDate();

      return {
        id: booking.bookingId,
        title: `${booking.name} - ${booking.serviceName}`,
        start: startDate,
        end: endDate,
        resource: booking,
      };
    });
  }, [bookings]);

  const eventStyleGetter = (event) => {
    const booking = event.resource;
    let backgroundColor = '#3b82f6'; // blue for pending
    
    switch(booking.status) {
      case 'confirmed':
        backgroundColor = '#10b981'; // green
        break;
      case 'completed':
        backgroundColor = '#6b7280'; // gray
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // red
        break;
      default:
        backgroundColor = '#f59e0b'; // amber for pending
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
      }
    };
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Booking Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Cancelled</span>
          </div>
        </div>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={(event) => onSelectEvent(event.resource)}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            style={{ height: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
