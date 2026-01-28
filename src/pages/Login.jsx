import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP, verifyOTP, otpSent, user } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOTP(mobile);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(otp)) {
      alert('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    try {
      const success = await verifyOTP(otp);
      if (success) {
        // Redirect based on role - wait a moment for user state to update
        setTimeout(() => {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.role === 'SUBADMIN') {
            navigate('/subadmin-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 100);
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RojgaAlert</h1>
            <p className="text-gray-600">Admin Panel</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className="input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-6">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength="6"
                  className="input text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  OTP sent to {mobile}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mb-3"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-secondary w-full"
              >
                Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;