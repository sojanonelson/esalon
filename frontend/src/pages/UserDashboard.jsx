import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { fetchUserAppointments } from '../api';

const UserDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user._id) {
            fetchUserAppointments(user._id)
                .then(res => {
                    setAppointments(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching appointments:", err);
                    setLoading(false);
                });
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-bgPrimary">
                <div className="glass-panel text-center p-10 rounded-2xl w-full max-w-md">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
                    <p className="text-gray-400 mb-6">Please log in to view your appointments.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 bg-bgPrimary">
            <div className="section-container max-w-5xl">
                <header className="mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold heading-gradient mb-2"
                    >
                        Welcome Back, {user.name}
                    </motion.h1>
                    <p className="text-gray-400">Track and manage your premium salon appointments.</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                            <Calendar className="text-accentPrimary" size={24} />
                            Your Appointments
                        </h2>

                        {loading ? (
                            <div className="glass-panel p-20 text-center rounded-2xl">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentPrimary mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading your bookings...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="glass-panel p-20 text-center rounded-2xl">
                                <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-medium mb-2">No Appointments Yet</h3>
                                <p className="text-gray-400 mb-6">Look like you haven't booked any services yet.</p>
                                <a href="/booking" className="btn-primary inline-flex">Book One Now</a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {appointments.map((apt, index) => (
                                    <motion.div
                                        key={apt._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-accentPrimary/30 transition-all"
                                    >
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                apt.status === 'confirmed' ? 'bg-[#4caf50]/20 text-[#4caf50]' :
                                                apt.status === 'completed' ? 'bg-[#2196f3]/20 text-[#2196f3]' :
                                                apt.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                'bg-[#ff9800]/20 text-[#ff9800]'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-1 text-white">{apt.serviceText || (apt.service && apt.service.name)}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 mb-4">
                                            <Clock size={16} />
                                            <span className="text-sm">{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {apt.time}</span>
                                        </div>

                                        <div className="flex justify-between items-end mt-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 uppercase">Amount</span>
                                                <span className="text-xl font-bold text-accentPrimary">₹{apt.amount}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-500 uppercase">Payment</span>
                                                <span className={`text-sm font-semibold ${apt.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {apt.paymentStatus === 'paid' ? 'Paid' : 'Pay at Counter'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
