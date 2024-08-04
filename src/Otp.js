import React, { useState, useEffect, useRef } from 'react';
import './Otp.css'; // Importing a CSS file for styling
import mikead from './images/mikeadress.svg';

function Otp({ color, onLoginClick }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30); // 1 minute timer
  const inputRefs = useRef([]);
  const recognition = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const otpRef = useRef(otp);
  const [showPopup, setShowPopup] = useState(false); 
  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        const digits = (interimTranscript + finalTranscript).replace(/\D/g, '').split('');
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          digits.forEach((digit, index) => {
            if (index < 4) {
              newOtp[index] = digit;
            }
          });
          console.log(newOtp);
          return newOtp;
        });

        // Move focus to the next empty input field
        const nextEmptyIndex = digits.length;
        if (nextEmptyIndex < 4 && inputRefs.current[nextEmptyIndex]) {
          inputRefs.current[nextEmptyIndex].focus();
        }
      };

      recognition.current.onstart = () => {
        setShowPopup(true);
        console.log('Voice recognition started');
      };

      recognition.current.onend = () => {
       setTimeout(()=>{ console.log('Voice recognition ended');
        console.log('OTP:', otpRef.current);
        onLoginClick(otpRef.current.join(''));
        setIsListening(false);},4000)
      };
    } else {
      console.error('Your browser does not support speech recognition.');
    }
  }, []);

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
      console.log(enteredOtp);
      onLoginClick(enteredOtp);
    } else {
      // Handle case where OTP is incomplete
      console.log(enteredOtp.length);
      console.error("Incomplete OTP");
    }
  };

  const handleMicClick = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
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
      <div className='login-action'>
        <button className="login-button" style={{ backgroundColor: color }} onClick={handleLogin}>Login</button>
        <img
          src={mikead} // Replace with your mic icon URL
          alt="Mic"
          className="mic-icon"
          onClick={handleMicClick}
        />
      </div>
      <p className="resend-text">Didn't receive OTP?</p>
      <p className="resend-link">Resend OTP</p>
      {showPopup && (
        <div className="popup">
          <p>Please speak now...</p>
        </div>
      )}
    </div>
  );
}

export default Otp;
