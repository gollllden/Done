import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

const AdminAnalytics = ({ bookings }) => {
  const analytics = useMemo(() => {
    // Service popularity
    const serviceCount = {};
    bookings.forEach(booking => {
      serviceCount[booking.serviceName] = (serviceCount[booking.serviceName] || 0) + 1;
    });

    const popularServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 25 ? name.substring(0, 25) + '...' : name,
        count,
        percentage: ((count / bookings.length) * 100).toFixed(1)
      }));

    // Monthly bookings trend
    const monthlyBookings = {};
    bookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });

    const bookingsTrend = Object.entries(monthlyBookings)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    // Status breakdown
    const statusBreakdown = {
      pending: bookings.filter(b => b.status === 'pending').length,
      'in-progress': bookings.filter(b => b.status === 'in-progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    // Customer insights
    const customerEmails = {};
    bookings.forEach(booking => {
      if (booking.email) {
        customerEmails[booking.email] = (customerEmails[booking.email] || 0) + 1;
      }
    });

    const repeatCustomers = Object.values(customerEmails).filter(count => count > 1).length;
    const totalCustomersWithEmail = Object.keys(customerEmails).length;

    return {
      popularServices,
      bookingsTrend,
      statusBreakdown,
      totalBookings: bookings.length,
      repeatCustomers,
      totalCustomersWithEmail,
      repeatRate: totalCustomersWithEmail > 0 
        ? ((repeatCustomers / totalCustomersWithEmail) * 100).toFixed(1) 
        : 0
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Repeat Customers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.repeatCustomers}</p>
                <p className="text-xs text-green-600">{analytics.repeatRate}% return rate</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.statusBreakdown['in-progress']}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.statusBreakdown.completed}</p>
              </div>
              <div className="text-green-600">✓</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Most Popular Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.popularServices.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  <span className="text-sm text-gray-600">{service.count} bookings ({service.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookings Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Bookings Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.bookingsTrend.map((data, index) => {
              const maxCount = Math.max(...analytics.bookingsTrend.map(d => d.count));
              const height = (data.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-semibold text-gray-700">{data.count}</div>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 text-center">{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{analytics.statusBreakdown.pending}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <p className="text-sm text-orange-800 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-orange-900">{analytics.statusBreakdown['in-progress']}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-800 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{analytics.statusBreakdown.completed}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-red-800 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">{analytics.statusBreakdown.cancelled}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
