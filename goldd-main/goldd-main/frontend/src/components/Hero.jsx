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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-blue-900/85" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-fade-in-up">
            Professional Cleaning Services
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 drop-shadow-lg mt-2 animate-fade-in-up animation-delay-200">
              Home and Car Wash
            </span>
          </h1>

          <p className="text-xl text-gray-200 mb-8 max-w-2xl animate-fade-in-up animation-delay-400">
            Experience premium mobile cleaning services in Calgary. From home cleaning to car wash and
            detailing services, we deliver exceptional results at your convenience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up animation-delay-600">
            <Button
              onClick={scrollToBooking}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 text-lg px-10 py-7 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 animate-bounce-subtle font-bold"
            >
              Book Your Service
            </Button>
            <Button
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-amber-400/60 text-white hover:bg-amber-500/20 hover:border-amber-300 text-lg px-10 py-7 transition-all duration-300 hover:scale-105"
            >
              View Services
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3 animate-fade-in-up animation-delay-800">
              <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Mobile Service</h3>
                <p className="text-gray-300 text-sm">Homes, cars &amp; events - we come to you</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 animate-fade-in-up animation-delay-1000">
              <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Full Service</h3>
                <p className="text-gray-300 text-sm">Home cleaning &amp; car wash</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 animate-fade-in-up animation-delay-1200">
              <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
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
