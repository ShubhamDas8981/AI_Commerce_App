import React, { useEffect, useState } from 'react';
import './Cart.css';
import cartImage from './images/bag.svg';
import dustbin from './images/trash.svg';
import cartIcon from './images/chevron-down.svg';
import { subscribe } from './pubsub';
import lne from './images/Rectangle 8.svg';
import verticalLine from './images/Line 4.svg';

function Cart({color,onCheckoutClick}) {
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart')) || []);

    useEffect(() => {
      const handleCartUpdate = (updatedCart) => {
        setCartItems(updatedCart);
      };
  
      subscribe('cartUpdated', handleCartUpdate);
  
      return () => {
        // Unsubscribe logic can be added here if needed
      };
    }, []);
    const handleQuantityChange = (index, action) => {
        const updatedCart = [...cartItems];
        if (action === 'decrement' && updatedCart[index].quantity > 0) {
          updatedCart[index].quantity -= 1;
        } else if (action === 'increment') {
          updatedCart[index].quantity += 1;
        }
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        // Publish cart update event if using pubsub for global state management
      };
      const handleRemoveItem = (index) => {
        const updatedCart = [...cartItems];
        updatedCart.splice(index, 1);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      };
      const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return (
    <div className="cart-page">
     <div className="cart-container">
        <div className="left-section">
          <img 
            src={cartImage} 
            alt="Cart" 
            className="cart-image" 
          /> 
          <span className="cart-text">Your Bag ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
        </div>
        <img 
          src={cartIcon} 
          alt="Chevron Down" 
          className="cart-icon" 
        /> 
      </div>
      <div className="cart-items-container">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            
            <div key={index} className="cart-item">
              <img 
                src={item.img} 
                alt={item.description} 
                className="cart-item-image" 
              />
              <div className="cart-item-details">
              
                <span className="cart-item-name"> {item.description1.slice(0, 35)} </span>
                
                  
                  
               
              </div>
            
            <div className='trash-name'>
            <img 
                    src={dustbin} 
                    alt="Icon" 
                    className="inline-icon" 
                    onClick={() => handleRemoveItem(index)}
                  />
            <button className="quantity-controls">
                  <button className="quantity-button" onClick={() => handleQuantityChange(index, 'decrement')}>
                    <span>-</span>
                  </button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button className="quantity-button" onClick={() => handleQuantityChange(index, 'increment')}>
                    <span>+</span>
                  </button>
                </button>
                </div>
               
            </div>
          ))
        ) : (
          <span className="empty-cart">Your cart is empty</span>
        )}
        
      </div>

      <div className="lne-container">
      <span className="cart-summary">{totalItems} Item(s) | ₹{totalPrice}</span>
        <img src={lne} alt="" className='lne'/>
        <img src={verticalLine} alt="Vertical Line" className='vertical-line'/>
        <button className="checkout-button" style={{ backgroundColor: color }} onClick={onCheckoutClick}>Checkout</button>
      </div>
    </div>
    
  );
}

export default Cart;
