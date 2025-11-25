import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { services } from '../mock';

const Services = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const carServices = services.filter(s => s.category === 'car');
  const homeServices = services.filter(s => s.category === 'home');

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 animate-fade-in">
            <span className="text-amber-700 font-semibold text-sm uppercase tracking-wider bg-amber-50 px-4 py-2 rounded-full">
              Our Services
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight animate-fade-in-up animation-delay-200">
            Premium Cleaning Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Professional home cleaning and car wash services tailored for Calgary
          </p>
        </div>

        {/* Car Services */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center animate-fade-in-up">
            Car Wash Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {carServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden hover:-translate-y-2 bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {service.discount && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      {service.discount}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-bold text-white">{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-sm text-gray-300 line-through ml-2">{service.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={scrollToBooking}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Select Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Home & Property Services */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center animate-fade-in-up">
            Home & Property Cleaning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {homeServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {service.discount && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      {service.discount}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-bold text-white">{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-sm text-gray-300 line-through ml-2">{service.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={scrollToBooking}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Select Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;