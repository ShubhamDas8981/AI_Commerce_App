import React from 'react';
import './Final.css';

function Final({ orderId }) {
    return (
        <div className="final-container">
            <div className="order-id">Order #{orderId} Placed!</div>
            <div className="order-status">Your order is currently in pending state.</div>
            <div className="order-info">
                This order needs to be confirmed with seller and might take up to 24 hours. If this order is accepted by the seller, the order will be confirmed as COD order if COD payment method is available or you will receive a payment link on your WhatsApp to complete the payment.
            </div>
            <div className="support-info">Please email support@craftsvilla.com for any queries.</div>
        </div>
    );
}

export default Final;