import React, { useEffect, useState } from 'react';
import './Wishlist.css';
import cartImage from './images/bag.svg';
import dustbin from './images/trash.svg';
import cartIcon from './images/chevron-down.svg';
import { subscribe } from './pubsub';
import lne from './images/Rectangle 8.svg';
import verticalLine from './images/Line 4.svg';

function Wishlist({color}) {
    const [WishlistItems, setWishItems] = useState(JSON.parse(localStorage.getItem('Wish')) || []);

    useEffect(() => {
      const handleWishUpdate = (updatedCart) => {
        setWishItems(updatedCart);
      };
  
      subscribe('WishcartUpdated', handleWishUpdate);
  
      return () => {
        // Unsubscribe logic can be added here if needed
      };
    }, []);
    const handleQuantityChange = (index, action) => {
        const updatedCart = [...WishlistItems];
        if (action === 'decrement' && updatedCart[index].quantity > 0) {
          updatedCart[index].quantity -= 1;
        } else if (action === 'increment') {
          updatedCart[index].quantity += 1;
        }
        setWishItems(updatedCart);
        localStorage.setItem('Wish', JSON.stringify(updatedCart));
        // Publish cart update event if using pubsub for global state management
      };
      const handleRemoveItem = (index) => {
        const updatedCart = [...WishlistItems];
        updatedCart.splice(index, 1);
        setWishItems(updatedCart);
        localStorage.setItem('Wish', JSON.stringify(updatedCart));
      };
      const totalItems = WishlistItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = WishlistItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return (
    <div className="cart-page">
     <div className="cart-container">
        <div className="left-section">
          <img 
            src={cartImage} 
            alt="Cart" 
            className="cart-image" 
          /> 
          <span className="cart-text">Your WishList ({WishlistItems.length} {WishlistItems.length === 1 ? 'item' : 'items'})</span>
        </div>
        <img 
          src={cartIcon} 
          alt="Chevron Down" 
          className="cart-icon" 
        /> 
      </div>
      <div className="cart-items-container">
        {WishlistItems.length > 0 ? (
          WishlistItems.map((item, index) => (
            
            <div key={index} className="cart-item">
              <img 
                src={item.img} 
                alt={item.description} 
                className="cart-item-image" 
              />
              <div className="cart-item-details">
              
                <span className="cart-item-name"> {item.description.slice(0, 15)} </span>
                
                  
                  
               
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
          <span className="empty-cart">Your Wishlist is empty</span>
        )}
        
      </div>

      <div className="lne-container">
      <span className="cart-summary">{totalItems} Item(s) | ₹{totalPrice}</span>
        <img src={lne} alt="" className='lne'/>
        <img src={verticalLine} alt="Vertical Line" className='vertical-line'/>
        <button className="checkout-button" style={{ backgroundColor: color }}>Checkout</button>
      </div>
    </div>
    
  );
}

export default Wishlist;
