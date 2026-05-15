import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api';
import { Scissors, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser({ name, email, password, phone });
        alert("Registration successful! Please login.");
        setIsRegister(false);
      } else {
        const res = await loginUser({ email, password });
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setShowLogin(false);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (location.pathname === '/dashboard') navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 glass-panel border-x-0 border-t-0 rounded-none' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-outfit text-2xl font-extrabold text-white">
          <Scissors className="text-accentPrimary" />
          <span>E-Salon</span>
        </Link>
        
        <div className="hidden md:flex gap-8">
          <Link to="/" className={`relative font-medium transition-colors duration-300 hover:text-white ${location.pathname === '/' ? 'text-white' : 'text-gray-400'}`}>
            Home
            {location.pathname === '/' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accentPrimary"></span>}
          </Link>
          <Link to="/booking" className={`relative font-medium transition-colors duration-300 hover:text-white ${location.pathname === '/booking' ? 'text-white' : 'text-gray-400'}`}>
            Book Appointment
            {location.pathname === '/booking' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accentPrimary"></span>}
          </Link>
          {user && user.role === 'admin' && (
            <Link to="/dashboard" className={`relative font-medium transition-colors duration-300 hover:text-white ${location.pathname === '/dashboard' ? 'text-white' : 'text-gray-400'}`}>
              Admin
              {location.pathname === '/dashboard' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accentPrimary"></span>}
            </Link>
          )}
          {user && user.role !== 'admin' && (
            <Link to="/my-appointments" className={`relative font-medium transition-colors duration-300 hover:text-white ${location.pathname === '/my-appointments' ? 'text-white' : 'text-gray-400'}`}>
              My Appointments
              {location.pathname === '/my-appointments' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accentPrimary"></span>}
            </Link>
          )}
        </div>
        
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn-secondary">Login</button>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-panel absolute top-full left-5 right-5 mt-2 flex flex-col p-5 gap-5 rounded-xl">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/booking" onClick={() => setMobileOpen(false)}>Book Appointment</Link>
          {user && user.role === 'admin' && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          {user && user.role !== 'admin' && (
            <Link to="/my-appointments" onClick={() => setMobileOpen(false)}>My Appointments</Link>
          )}
          {user ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-secondary w-full">Logout</button>
          ) : (
            <button onClick={() => { setShowLogin(true); setMobileOpen(false); }} className="btn-secondary w-full">Login</button>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-5">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 text-white text-center">{isRegister ? 'Join E-Salon' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {isRegister && (
                <>
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <input type="text" required className="input-field mt-1" value={name} onChange={e=>setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone Number</label>
                    <input type="text" required className="input-field mt-1" value={phone} onChange={e=>setPhone(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input type="email" required className="input-field mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-400">Password</label>
                <input type="password" required className="input-field mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary mt-2">
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-6">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-accentPrimary font-semibold ml-2 hover:underline"
              >
                {isRegister ? 'Login' : 'Register Now'}
              </button>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
