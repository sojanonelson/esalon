import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, User, Calendar, Settings, DollarSign, Activity, FileText } from 'lucide-react';
import { fetchAppointments, updateAppointmentStatus, fetchServices, fetchStaff, createService, createStaff } from '../api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', category: '' });
  const [newStaff, setNewStaff] = useState({ name: '', role: '', email: '', phone: '' });

  const getCustomers = () => {
    const map = {};
    appointments.forEach(a => {
      const key = a.email || a.userText;
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          name: a.userText || "Unknown",
          email: a.email || "N/A",
          phone: a.phone || "N/A",
          totalSpent: 0,
          history: []
        };
      }
      map[key].totalSpent += (a.amount || 500);
      map[key].history.push(a);
    });
    return Object.values(map);
  };
  const customers = getCustomers();

  // Auth Protection
  const userStr = localStorage.getItem('user');
  const isAdmin = userStr && JSON.parse(userStr).role === 'admin';

  const loadData = async () => {
    try {
      const [appRes, servRes, staffRes] = await Promise.all([
        fetchAppointments(),
        fetchServices(),
        fetchStaff()
      ]);
      setAppointments(appRes.data || []);
      setServices(servRes.data || []);
      setStaff(staffRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadData(); // Re-fetch all data to ensure synchronization
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    try {
      await createService(newService);
      setNewService({ name: '', price: '', duration: '', category: '' });
      loadData();
    } catch (err) { alert("Error adding service"); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) return;
    try {
      await createStaff(newStaff);
      setNewStaff({ name: '', role: '', email: '', phone: '' });
      loadData();
    } catch (err) { alert("Error adding staff"); }
  };

  const stats = [
    { title: "Total Bookings", value: appointments.length || "0", icon: <Calendar />, color: "#cba365", bgClass: "bg-[#cba365]/20", textClass: "text-[#cba365]" },
    { title: "Revenue", value: `₹${customers.reduce((sum, c) => sum + c.totalSpent, 0)}`, icon: <DollarSign />, color: "#4caf50", bgClass: "bg-[#4caf50]/20", textClass: "text-[#4caf50]" },
    { title: "Active Staff", value: staff.length || "0", icon: <Users />, color: "#2196f3", bgClass: "bg-[#2196f3]/20", textClass: "text-[#2196f3]" }
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 flex items-start justify-center bg-bgPrimary">
        <div className="glass-panel text-center p-10 mt-10 rounded-2xl w-full max-w-md mx-4">
          <h2 className="text-3xl text-red-500 font-bold mb-4">Access Denied</h2>
          <p className="text-gray-400">You must log in as an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-20 bg-bgPrimary">
      <div className="w-full md:w-[250px] md:fixed md:h-[calc(100vh-80px)] glass-panel rounded-none border-x-0 border-t-0 md:border-b-0 py-6">
        <div className="px-6 mb-6">
          <h3 className="text-gray-400 text-sm uppercase tracking-wide">Admin Panel</h3>
        </div>
        <nav className="flex md:flex-col overflow-x-auto">
          {['overview', 'bookings', 'customers', 'staff', 'services', 'reports'].map((tab) => (
            <button 
              key={tab}
              className={`flex items-center gap-3 px-6 py-4 text-[15px] font-inherit text-left whitespace-nowrap transition-all duration-300 border-b-4 md:border-b-0 md:border-r-4 hover:text-white hover:bg-white/5 ${activeTab === tab ? 'text-accentPrimary border-accentPrimary' : 'text-gray-400 border-transparent'}`} 
              onClick={() => { setActiveTab(tab); if(tab !== 'customers') setSelectedCustomer(null); }}
            >
              {tab === 'overview' && <Activity size={18} />}
              {tab === 'bookings' && <Calendar size={18} />}
              {tab === 'customers' && <Users size={18} />}
              {tab === 'staff' && <User size={18} />}
              {tab === 'services' && <Settings size={18} />}
              {tab === 'reports' && <FileText size={18} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 md:ml-[250px] p-5 md:p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl heading-gradient font-bold">Overview</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accentPrimary flex items-center justify-center font-bold text-white">A</div>
            <span className="font-medium">Admin</span>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="glass-panel p-6 flex items-center gap-5 rounded-xl">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass} ${stat.textClass}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white leading-none">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-xl mt-8 overflow-x-auto">
              <h3 className="text-xl font-semibold mb-5">Recent Appointments</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Customer</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Service</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Time</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Payment</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Status</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="p-4 text-center">Loading appointments...</td></tr>
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center">No appointments found.</td></tr>
                  ) : appointments.slice(0, 5).map(b => (
                    <tr key={b._id || Math.random()}>
                      <td className="p-4 border-b border-white/5">{b.userText || "Unknown"}</td>
                      <td className="p-4 border-b border-white/5">{b.serviceText || "Custom Service"}</td>
                      <td className="p-4 border-b border-white/5">{b.date ? new Date(b.date).toLocaleDateString() : ""} {b.time}</td>
                      <td className="p-4 border-b border-white/5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.paymentStatus === 'paid' ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>
                          {b.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-[#4caf50]/20 text-[#4caf50]' : b.status === 'completed' ? 'bg-[#2196f3]/20 text-[#2196f3]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 border-b border-white/5 flex gap-2">
                        {(!b.status || b.status === 'pending') && (
                          <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="bg-transparent border border-accentPrimary text-accentPrimary px-3 py-1.5 rounded-md text-sm transition-all duration-300 hover:bg-accentPrimary hover:text-white">Confirm</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleUpdateStatus(b._id, 'completed')} className="bg-transparent border border-[#4caf50] text-[#4caf50] px-3 py-1.5 rounded-md text-sm transition-all duration-300 hover:bg-[#4caf50] hover:text-white">Complete</button>
                        )}
                        {b.status === 'completed' && (
                          <span className="text-gray-500 text-sm">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel mt-6 p-6 rounded-xl overflow-x-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold">All Appointments</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Customer</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Service</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Time</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Payment</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Status</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-4 text-center text-gray-400">Loading all appointments...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-gray-400">No appointments found.</td></tr>
                ) : appointments.map(b => (
                  <tr key={b._id || Math.random()}>
                    <td className="p-4 border-b border-white/5 font-medium">{b.userText || "Unknown"}</td>
                    <td className="p-4 border-b border-white/5">{b.serviceText || "Custom Service"}</td>
                    <td className="p-4 border-b border-white/5">{b.date ? new Date(b.date).toLocaleDateString() : ""} {b.time}</td>
                    <td className="p-4 border-b border-white/5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.paymentStatus === 'paid' ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>
                        {b.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-[#4caf50]/20 text-[#4caf50]' : b.status === 'completed' ? 'bg-[#2196f3]/20 text-[#2196f3]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 border-b border-white/5 flex gap-2">
                      {(!b.status || b.status === 'pending') && (
                        <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="bg-transparent border border-accentPrimary text-accentPrimary px-3 py-1.5 rounded-md text-sm transition-all duration-300 hover:bg-accentPrimary hover:text-white">Confirm</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleUpdateStatus(b._id, 'completed')} className="bg-transparent border border-[#4caf50] text-[#4caf50] px-3 py-1.5 rounded-md text-sm transition-all duration-300 hover:bg-[#4caf50] hover:text-white">Complete</button>
                      )}
                      {b.status === 'completed' && (
                        <span className="text-gray-500 text-sm">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'customers' && !selectedCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel mt-6 p-6 rounded-xl overflow-x-auto">
            <h3 className="text-xl font-semibold mb-5">Customer Profiles</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Name</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Email</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Phone</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Total Spent</th>
                  <th className="p-4 text-gray-400 font-medium border-b border-white/10">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i}>
                    <td className="p-4 border-b border-white/5 font-medium">{c.name}</td>
                    <td className="p-4 border-b border-white/5">{c.email}</td>
                    <td className="p-4 border-b border-white/5">{c.phone}</td>
                    <td className="p-4 border-b border-white/5 text-[#4caf50]">₹{c.totalSpent}</td>
                    <td className="p-4 border-b border-white/5">
                      <button onClick={() => setSelectedCustomer(c)} className="bg-transparent border border-accentPrimary text-accentPrimary px-3 py-1.5 rounded-md text-sm transition-all duration-300 hover:bg-accentPrimary hover:text-white">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'customers' && selectedCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <button onClick={() => setSelectedCustomer(null)} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2">← Back to Customers</button>
            <div className="glass-panel p-8 rounded-xl mb-6">
              <h3 className="text-2xl font-bold mb-4 text-white">Customer Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-gray-500">Name:</span> <span className="text-white font-medium ml-2">{selectedCustomer.name}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="text-white font-medium ml-2">{selectedCustomer.email}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="text-white font-medium ml-2">{selectedCustomer.phone}</span></div>
                <div><span className="text-gray-500">Total Value:</span> <span className="text-[#4caf50] font-medium ml-2">₹{selectedCustomer.totalSpent}</span></div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-xl overflow-x-auto">
              <h3 className="text-xl font-semibold mb-5 text-white">Transaction History</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Date</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Service</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Amount</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Payment</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCustomer.history.map((h, i) => (
                    <tr key={i}>
                      <td className="p-4 border-b border-white/5">{h.date ? new Date(h.date).toLocaleDateString() : ""} {h.time}</td>
                      <td className="p-4 border-b border-white/5">{h.serviceText}</td>
                      <td className="p-4 border-b border-white/5 text-[#4caf50]">₹{h.amount || 500}</td>
                      <td className="p-4 border-b border-white/5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${h.paymentStatus === 'paid' ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>{h.paymentStatus}</span>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${h.status === 'confirmed' ? 'bg-[#4caf50]/20 text-[#4caf50]' : h.status === 'completed' ? 'bg-[#2196f3]/20 text-[#2196f3]' : 'bg-[#ff9800]/20 text-[#ff9800]'}`}>{h.status || 'pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-panel p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Staff Member</h3>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Name" required className="input-field" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name: e.target.value})} />
                <input type="text" placeholder="Role (e.g. Senior Stylist)" required className="input-field" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})} />
                <input type="email" placeholder="Email" className="input-field" value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email: e.target.value})} />
                <button type="submit" className="btn-primary">Add Staff</button>
              </form>
            </div>
            <div className="glass-panel p-6 rounded-xl overflow-x-auto">
              <h3 className="text-xl font-semibold mb-4">Active Staff</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Name</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Role</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Email</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={i}>
                      <td className="p-4 border-b border-white/5">{s.name}</td>
                      <td className="p-4 border-b border-white/5">{s.role}</td>
                      <td className="p-4 border-b border-white/5">{s.email || '-'}</td>
                      <td className="p-4 border-b border-white/5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.availability ? 'bg-[#4caf50]/20 text-[#4caf50]' : 'bg-red-500/20 text-red-500'}`}>
                          {s.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">No staff members found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-panel p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Service Name" required className="input-field" value={newService.name} onChange={e=>setNewService({...newService, name: e.target.value})} />
                <input type="number" placeholder="Price (₹)" required className="input-field" value={newService.price} onChange={e=>setNewService({...newService, price: e.target.value})} />
                <input type="number" placeholder="Duration (mins)" className="input-field" value={newService.duration} onChange={e=>setNewService({...newService, duration: e.target.value})} />
                <button type="submit" className="btn-primary">Add Service</button>
              </form>
            </div>
            <div className="glass-panel p-6 rounded-xl overflow-x-auto">
              <h3 className="text-xl font-semibold mb-4">Service Catalog</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Name</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Price</th>
                    <th className="p-4 text-gray-400 font-medium border-b border-white/10">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={i}>
                      <td className="p-4 border-b border-white/5 font-medium">{s.name}</td>
                      <td className="p-4 border-b border-white/5 text-[#4caf50]">₹{s.price}</td>
                      <td className="p-4 border-b border-white/5">{s.duration ? `${s.duration} mins` : '-'}</td>
                    </tr>
                  ))}
                  {services.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">No services found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold mb-6 text-white">System Reports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <DollarSign size={36} className="text-[#4caf50] mb-3" />
                <p className="text-gray-400 text-sm">Total Lifetime Revenue</p>
                <h2 className="text-3xl font-bold text-white mt-1">₹{customers.reduce((acc, c) => acc + c.totalSpent, 0)}</h2>
              </div>
              <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <Activity size={36} className="text-accentPrimary mb-3" />
                <p className="text-gray-400 text-sm">Most Popular Service</p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {Object.entries(appointments.reduce((acc, a) => {
                    acc[a.serviceText] = (acc[a.serviceText] || 0) + 1;
                    return acc;
                  }, {})).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}
                </h2>
              </div>
              <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <Calendar size={36} className="text-[#2196f3] mb-3" />
                <p className="text-gray-400 text-sm">Appointments Completed</p>
                <h2 className="text-3xl font-bold text-white mt-1">{appointments.filter(a => a.status === 'completed').length}</h2>
              </div>
              <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <Users size={36} className="text-[#ff9800] mb-3" />
                <p className="text-gray-400 text-sm">Pending Appointments</p>
                <h2 className="text-3xl font-bold text-white mt-1">{appointments.filter(a => a.status === 'pending').length}</h2>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
