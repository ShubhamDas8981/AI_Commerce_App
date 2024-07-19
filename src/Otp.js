import React,  { useState, useEffect, useRef }  from 'react';
import './Otp.css'; // Importing a CSS file for styling

function Otp({ color, onLoginClick }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30); // 1 minute timer
  const inputRefs = useRef([]);
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
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Ensure only digits are entered
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input field if a digit is entered
      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleLogin = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 4) {
      onLoginClick(enteredOtp);
    } else {
      // Handle case where OTP is incomplete
      console.error("Incomplete OTP");
    }
  };

  return (
    <div className="otp-container">
      <h2 className='otp'>OTP</h2>
      <div className="otp-input-container">
      {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className="otp-input"
            value={value}
            onChange={(e) => handleOtpChange(e, index)}
            ref={el => inputRefs.current[index] = el}
          />
        ))}
      </div>
      <p className="timer">{timer} seconds remaining</p>
      <button className="login-button" style={{ backgroundColor: color }}  onClick={handleLogin} >Login</button>
      <p className="resend-text">Didn't receive OTP?</p>
      <p className="resend-link">Resend OTP</p>

    </div>
  );
}

export default Otp;
