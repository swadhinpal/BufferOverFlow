import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get the location object
  const email = location.state?.email; // Retrieve the email from the location state

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:4000/verify-otp`, { email, otp });
      if (response.data.message === 'OTP verified successfully') {
        navigate('/update-password', { state: { email } });
      } else {
        setError('Invalid or expired OTP');
      }
    } catch (error) {
      setError('Error verifying OTP');
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="otp"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default VerifyOtp;
