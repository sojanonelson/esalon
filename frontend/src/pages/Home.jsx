import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-1/2 h-[70%] bg-[radial-gradient(circle,rgba(203,163,101,0.15)_0%,rgba(10,10,15,0)_70%)] z-0 pointer-events-none"></div>
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center md:text-left"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-accentPrimary glass-panel mb-6">
              <Sparkles size={16} />
              Premium Salon Experience
            </span>
            <h1 className="text-5xl md:text-6xl/tight mb-6 font-bold">
              Elevate Your <br />
              <span className="heading-gradient">Style & Elegance</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-md mx-auto md:mx-0">
              Book your next hair, beauty, or spa appointment with our completely automated online booking system. No more waiting, just perfect styling.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/booking" className="btn-primary">
                Book Now <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary">Explore Services</button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(203,163,101,0.2)_0%,rgba(10,10,15,0)_70%)] -z-10 blur-[40px]"></div>
            <img 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
              alt="Salon Luxury" 
              className="w-full rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10"
            />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-bgSecondary relative">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl heading-gradient mb-4 font-bold">Our Premium Services</h2>
            <p className="text-gray-400 text-lg">Experience the Pinnacle of Grooming & Beauty.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Hair Styling", desc: "Precision cuts and coloring from expert stylists.", price: "From ₹450" },
              { title: "Spa & Massage", desc: "Relaxing spa treatments to rejuvenate your soul.", price: "From ₹900" },
              { title: "Makeup & Bridal", desc: "Professional makeup for your most important days.", price: "From ₹1200" },
              { title: "Skin Care", desc: "Advanced facials and skincare routines.", price: "From ₹650" }
            ].map((service, index) => (
              <motion.div 
                key={index}
                className="glass-panel p-8 flex flex-col gap-4 rounded-2xl"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-semibold">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed grow">{service.desc}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold font-outfit text-accentPrimary text-xl">{service.price}</span>
                  <Link to="/booking" className="bg-white/5 border border-accentPrimary text-white px-4 py-2 rounded-md text-sm font-semibold transition duration-300 hover:bg-accentPrimary hover:text-white">Book</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
