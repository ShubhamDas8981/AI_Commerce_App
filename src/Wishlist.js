import React, { useEffect, useState } from 'react';
import './Wishlist.css';
import cartImage from './images/bag.svg';
import dustbin from './images/trash.svg';
import cartIcon from './images/chevron-down.svg';
import { subscribe } from './pubsub';

function Wishlist() {
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
   
      const handleRemoveItem = (index) => {
        const updatedCart = [...WishlistItems];
        updatedCart.splice(index, 1);
        setWishItems(updatedCart);
        localStorage.setItem('Wish', JSON.stringify(updatedCart));
      };
      
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
                alt={item.description1} 
                className="cart-item-image" 
              />
              <div className="cart-item-details">
              
                <span className="cart-item-name"> {item.description1.slice(0,100)} </span>
                <div className='price'>
                <span className="cart-item-price"> ₹{item.price} </span>
                <span className="cart-item-price2"> ₹{item.originalPrice} </span>
                </div>
                
                  
                  
               
              </div>
            
            <div className='trash-name'>
            <img 
                    src={dustbin} 
                    alt="Icon" 
                    className="inline-icon" 
                    onClick={() => handleRemoveItem(index)}
                  />
           
                </div>
               
            </div>
          ))
        ) : (
          <span className="empty-cart">Your Wishlist is empty</span>
        )}
        
      </div>

    </div>
    
  );
}

export default Wishlist;
