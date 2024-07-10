import React from 'react';
import './Popup.css';

const Popup = ({ image, name, onClose }) => (
  <div className="popu">
    <div className="popup-content">
      <img src={image} alt={name} className="popup-image" />
      <h5 className="popup-name">{name}</h5>
      <button className="popup-close" onClick={onClose}>✖</button>
    </div>
  </div>
);

export default Popup;
