import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

const HERO_IMAGE_URL =
  'https://customer-assets.emergentagent.com/job_038f5287-0ae4-4474-bffb-d48d321d9405/artifacts/jgvotv49_WhatsApp%20Image%202025-11-21%20at%2012.58.21%20AM.jpeg';

const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${HERO_IMAGE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Professional Cleaning Services
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 drop-shadow-lg mt-2">
              For Your Car &amp; Home
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Experience premium mobile cleaning services in Calgary. From car detailing to home cleaning and
            event services, we deliver exceptional results at your convenience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              onClick={scrollToBooking}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-10 py-7 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Book Your Service
            </Button>
            <Button
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 text-lg px-10 py-7 transition-all duration-300"
            >
              View Services
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Mobile Service</h3>
                <p className="text-gray-300 text-sm">Cars, homes &amp; events - we come to you</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Full Service</h3>
                <p className="text-gray-300 text-sm">Car detailing &amp; property cleaning</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Satisfaction Guaranteed</h3>
                <p className="text-gray-300 text-sm">100% quality assurance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
