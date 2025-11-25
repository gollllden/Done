import React from 'react';
import { Award, Users, Clock, Shield } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Happy Clients', value: '500+' },
    { icon: Clock, label: 'Years Experience', value: '5+' },
    { icon: Award, label: 'Service Excellence', value: '100%' },
    { icon: Shield, label: 'Satisfaction Guarantee', value: 'Always' }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-block mb-4">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-50 px-4 py-2 rounded-full">
                About Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Calgary's Most Trusted Mobile Cleaning Service
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Golden Touch Cleaning Services, we're passionate about delivering exceptional cleaning services for both vehicles and properties. Our team of certified professionals uses premium products and proven techniques to make everything shine like new.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We understand your time is valuable. That's why we bring our professional-grade equipment and expertise directly to your home or office in Calgary. From car detailing to home cleaning, event services, and contract cleaning – we're your one-stop solution.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Professional Excellence</h3>
                  <p className="text-gray-600">Trained technicians with expertise in car detailing and property cleaning</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Complete Solutions</h3>
                  <p className="text-gray-600">From vehicles to homes, events, and contract cleaning – we do it all</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Scheduling</h3>
                  <p className="text-gray-600">Book a time that works for you – we operate 7 days a week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-10 h-10 text-blue-600 mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;