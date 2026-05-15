import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Scissors, User } from 'lucide-react';
import { createAppointment, createRazorpayOrder, verifyPayment, fetchServices } from '../api';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const getServices = async () => {
      try {
        const { data } = await fetchServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      }
    };
    getServices();
  }, []);

  const timeSlots = ["10:00 AM", "11:00 AM", "12:30 PM", "02:00 PM", "04:00 PM", "05:30 PM"];

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const submitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Generate Order via Express route
      const { data: order } = await createRazorpayOrder(selectedService.price); 

      // 2. Initialize Razorpay Checkout Overlay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SecQO2hc4XClya', 
        amount: order.amount,
        currency: order.currency,
        name: "E-Salon Premium",
        description: `Booking for ${formData.service}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Optional Backend verification
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // 4. Save Actual Appointment in DB upon payment auth
              await createAppointment({
                user: user?._id,
                userText: formData.name,
                email: formData.email,
                phone: formData.phone,
                amount: selectedService.price,
                serviceText: selectedService.name,
                date: formData.date,
                time: formData.time,
                status: 'pending',
                paymentStatus: 'paid'
              });

              alert("Payment Successful! Booking Confirmed.");
              setStep(1);
              setFormData({ service: '', date: '', time: '', name: '', email: '', phone: '' });
            }
          } catch (verifyError) {
            alert("Payment verification failed! Appointment unconfirmed.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: "9999999999" // Fallback number
        },
        theme: {
          color: "#cba365"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment was aborted or failed!");
      });
      rzp.open();

    } catch (error) {
      console.error("Razorpay Generation failed", error);
      alert("Failed to initialize payment gateway.");
    }
    setLoading(false);
  };

  return (
    <div className="section-container pt-32 min-h-screen flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-2xl p-10 rounded-2xl h-fit"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl heading-gradient font-bold">Book Your Appointment</h2>
          <div className="flex justify-center gap-2 mt-5">
            <div className={`h-1.5 w-10 rounded transition-all duration-300 ${step >= 1 ? 'bg-accentPrimary' : 'bg-white/10'}`}></div>
            <div className={`h-1.5 w-10 rounded transition-all duration-300 ${step >= 2 ? 'bg-accentPrimary' : 'bg-white/10'}`}></div>
            <div className={`h-1.5 w-10 rounded transition-all duration-300 ${step >= 3 ? 'bg-accentPrimary' : 'bg-white/10'}`}></div>
          </div>
        </div>

        <form onSubmit={submitBooking}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-2xl mb-6 font-semibold">Select Service</h3>
              
              {services.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Scissors className="mx-auto mb-4 opacity-20" size={48} />
                  <p>No services available at the moment. Please check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(srv => (
                    <div 
                      key={srv._id} 
                      className={`p-4 border rounded-xl flex flex-col items-center gap-3 cursor-pointer transition duration-300 ${selectedService?._id === srv._id ? 'border-accentPrimary bg-accentPrimary/10 text-accentPrimary' : 'border-white/10 bg-white/5 hover:border-accentHover'}`}
                      onClick={() => {
                          setFormData({...formData, service: srv.name});
                          setSelectedService(srv);
                      }}
                    >
                      <Scissors size={20} />
                      <div className="text-center">
                        <div className="font-semibold">{srv.name}</div>
                        <div className="text-xs text-gray-400 mt-1">₹{srv.price} • {srv.duration} mins</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="button" 
                className="btn-primary mt-8 w-full sm:w-auto" 
                onClick={handleNext} 
                disabled={!selectedService}
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-2xl mb-6 font-semibold">Select Date & Time</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-400"><CalendarIcon size={16} /> Date</label>
                <input 
                  type="date" 
                  className="input-field [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                {timeSlots.map(time => (
                  <div 
                    key={time} 
                    className={`p-3 border rounded-lg text-center cursor-pointer flex items-center justify-center gap-2 text-sm transition-all duration-300 ${formData.time === time ? 'bg-accentPrimary border-accentPrimary text-white' : 'border-white/10 hover:border-accentPrimary'}`}
                    onClick={() => setFormData({...formData, time})}
                  >
                    <Clock size={16} /> {time}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" className="btn-secondary" onClick={handlePrev}>Back</button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleNext}
                  disabled={!formData.date || !formData.time}
                >
                  Next Step
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-2xl mb-6 font-semibold">Review Your Booking</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400">Service</span>
                  <span className="font-semibold text-accentPrimary">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400">Date & Time</span>
                  <span className="font-semibold">{formData.date} at {formData.time}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-accentPrimary">₹{selectedService?.price}</span>
                </div>
                
                {user ? (
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Booking Account</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accentPrimary/20 flex items-center justify-center text-accentPrimary text-xs font-bold">{user.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-400"><User size={16}/> Full Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-400">Email Address</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" className="btn-secondary" onClick={handlePrev}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading || (!user && (!formData.name || !formData.email))}>
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Booking;
