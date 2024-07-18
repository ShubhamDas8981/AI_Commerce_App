import React, { useState, useEffect } from 'react';
import './Otp.css'; // Importing a CSS file for styling

function Otp({ color }) {
  const [timer, setTimer] = useState(30); // 1 minute timer

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer === 0) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  return (
    <div className="otp-container">
      <h2 className='otp'>OTP</h2>
      <div className="otp-input-container">
        <input type="text" maxLength="1" className="otp-input" />
        <input type="text" maxLength="1" className="otp-input" />
        <input type="text" maxLength="1" className="otp-input" />
        <input type="text" maxLength="1" className="otp-input" />
      </div>
      <p className="timer">{timer} seconds remaining</p>
      <button className="login-button" style={{ backgroundColor: color }} >Login</button>
      <p className="resend-text">Didn't receive OTP?</p>
      <p className="resend-link">Resend OTP</p>

    </div>
  );
}

export default Otp;
