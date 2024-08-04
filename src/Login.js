import React, { useState, useRef, useEffect } from 'react';
import './Login.css'; // Importing a CSS file for styling
import cartIcon from './images/chevron-down.svg';
import mikead from './images/mikeadress.svg';

function Login({ color, onContinueClick }) {
  const [phone, setPhone] = useState('');
  const recognition = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 

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

        const digits = (interimTranscript + finalTranscript).replace(/\D/g, '');
        setPhone(digits);
      };

      recognition.current.onstart = () => {
        setShowPopup(true);
        console.log('Voice recognition started');
      };

      recognition.current.onend = () => {
        setTimeout(() => {
          setIsListening(false);
          console.log('Voice recognition ended');
          onContinueClick(document.getElementById("phoni").value);
        }, 4000);
      };
    } else {
      console.error('Your browser does not support speech recognition.');
    }
  }, [phone]);

  const handleMicClick = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleContinue = () => {
    if (phone) {
      onContinueClick(phone);
    } else {
      // Handle case where phone number is empty
      alert("Phone number is required");
      console.error("Phone number is required");
    }
  };

  return (
    <div className="login-container">
      <h2 className='login'>Login or Signup</h2>
      <div className="input-container">
        <div className="country-code">
          +91 <img src={cartIcon} alt="Chevron Up" />
        </div>
        <input 
        id="phoni"
          type="text" 
          className="mobile-input" 
          placeholder="Mobile number" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)} 
        />
      </div>
      <div className='otp-action'>
        <button 
          className="continue-button" 
          style={{ backgroundColor: color }} 
          onClick={handleContinue}
        >
          Continue
        </button>
        <img
          src={mikead} // Replace with your mic icon URL
          alt="Mic"
          className="mic-icon"
          onClick={handleMicClick}
        />
      </div>
      <p className="terms-text">
        By continuing, I agree to the <a href="/terms-of-use">Terms of Use</a> & <a href="/privacy-policy">Privacy Policy</a>
      </p>
      {showPopup && (
        <div className="popup">
          <p>Please speak now...</p>
        </div>
      )}
    </div>
  );
}

export default Login;
