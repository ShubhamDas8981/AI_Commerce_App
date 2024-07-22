import React, { useState, useRef } from 'react';
import './Address.css';
import mikead from './images/mikeadress.svg'

function Address({ color ,onaddressclick}) {
  const [addressInput, setAddressInput] = useState('');

  const [showPopup, setShowPopup] = useState(false); 
  const recognition = useRef(null);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const handleMicClick = () => {
    
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
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

        setAddressInput( interimTranscript + finalTranscript);
      };

      recognition.current.onstart = () => {
        setShowPopup(true);        console.log('Voice recognition started');
      };

      recognition.current.onend = () => {
     
        console.log('Voice recognition ended');
        onaddressclick(addressInput);
        setShowPopup(false);
      };

      recognition.current.start();
    } else {
      console.error('Your browser does not support speech recognition.');
    }
  };

  const handleAddAddressClick = () => {
   onaddressclick(addressInput);
  };

  return (
    <div className="address-container">
      <h3>Address</h3>
      <textarea
        className="address-input"
        placeholder="Enter Full address"
        value={addressInput}
        onChange={(e) => setAddressInput(e.target.value)}
      ></textarea>
      <div className="address-action">
        <button className="add-address-button" style={{ backgroundColor: color }} onClick={handleAddAddressClick}>
          Add Address
        </button>
        <img
          src={mikead} // Replace with your mic icon URL
          alt="Mic"
          className="mic-ico"
          onClick={handleMicClick}
        />
      </div>
      {showPopup && (
        <div className="popup">
          <p>Please speak now...</p>
        </div>
      )}
    </div>
  );
}

export default Address;
