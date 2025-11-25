import React, { Suspense, lazy } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';

// Lazy-loaded routes and heavy components to keep initial bundle small
const BookingForm = lazy(() => import('@/components/BookingForm'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const CustomerPortal = lazy(() => import('@/pages/CustomerPortal'));

const HomePage = () => (
  <>
    <Header />
    <Hero />
    <Services />
    <About />
    <Testimonials />
    {/* Booking form is fairly heavy (calendar, axios, date libs), so we lazy-load it */}
    <Suspense
      fallback={
        <div
          className="py-24 flex items-center justify-center text-gray-500"
          data-testid="booking-form-loading"
        >
          Loading booking form...
        </div>
      }
   >
      <BookingForm />
    </Suspense>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App" data-testid="golden-touch-app">
          <Suspense
            fallback={
              <div
                className="min-h-screen flex items-center justify-center bg-white text-gray-600"
                data-testid="app-loading"
              >
                Loading Golden Touch...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
