import React, { useState, useEffect, useRef,useCallback  } from 'react';
import { publish } from './pubsub';
import './Product.css';
import stack from './images/Group 139 (1).svg';
import like from './images/Group 132 (1).svg';
import info from './images/Group 141 (1).svg';

function Product({product_id, key, img, name, description,description1, price, originalPrice, onLongPress, onDoubleClick, changetoggle, changetoggle2, url, score, buymode,onInfoClick,onProductVisible }) {
  const [isVisible, setIsVisible] = useState(false);

  const longPressTimeout = useRef(null);
  const doubleClickTimeout = useRef(null);
  const lastClickTime = useRef(0);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const isLongPress = useRef(false);
  const longPressStartTime = useRef(0);
  const productRef = useRef(null);
  const scoreNumber = parseFloat(score);

  const getBackgroundColor = () => {
    if (scoreNumber > 75) {
      return '#629E58';
    } else if (scoreNumber >= 60) {
      return '#E19926';
    } else {
      return '#FF6746';

    }
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log(`Product ${product_id} - Intersection observed:`, entry);
        if (entry.isIntersecting) {
          onProductVisible(product_id);
        }
      },
      {
        root: null,
        threshold: 1, // Adjust as needed
      }
    );

    if (productRef.current) {
      observer.observe(productRef.current);
    }

    return () => {
      if (productRef.current) {
        observer.unobserve(productRef.current);
      }
    };
  }, [product_id, onProductVisible]);

  const backgroundColor = getBackgroundColor();


  useEffect(() => {
    setIsVisible(false);
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [img, name, description, price, originalPrice, url]);

  const discountPercentage = ((originalPrice - price) / originalPrice * 100).toFixed(0);

  const handleMouseDown = (event) => {
    event.preventDefault();
    isLongPress.current = false;
    if (!isSliderDragging) {
      longPressStartTime.current = new Date().getTime();
      longPressTimeout.current = setTimeout(() => {
        const longPressEndTime = new Date().getTime();
        console.log('Long press triggered after', (longPressEndTime - longPressStartTime.current) / 1000, 'seconds');
        isLongPress.current = true;
        onLongPress();
      }, 3000);
    }
  };

  const handleMouseUp = (event) => {
    event.preventDefault();
    clearTimeout(longPressTimeout.current);

    if (!isSliderDragging && !isLongPress.current) {
      const clickTime = new Date().getTime();
      if (clickTime - lastClickTime.current < 300) {
        onDoubleClick();
        clearTimeout(doubleClickTimeout.current);
      } else {
        doubleClickTimeout.current = setTimeout(() => {
          window.open(url, '_blank');
        }, 300);
      }
      lastClickTime.current = clickTime;
    }
    setIsSliderDragging(false);
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    isLongPress.current = false;
    if (!isSliderDragging) {
      longPressTimeout.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, 3000);
    }
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    clearTimeout(longPressTimeout.current);

    if (!isSliderDragging && !isLongPress.current) {
      const clickTime = new Date().getTime();
      if (clickTime - lastClickTime.current < 300) {
        onDoubleClick();
        clearTimeout(doubleClickTimeout.current);
      } else {
        doubleClickTimeout.current = setTimeout(() => {
          window.open(url, '_blank');
        }, 300);
      }
      lastClickTime.current = clickTime;
    }
    setIsSliderDragging(false);
  };

  const handleTouchMove = () => {
    setIsSliderDragging(true);
  };

  const handleTouchCancel = () => {
    setIsSliderDragging(false);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  const handleAddToCart = () => {
    const productDetails = { key, img, description1, price, originalPrice, quantity: 1 };
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productDetails);
    localStorage.setItem('cart', JSON.stringify(cart));
    publish('cartUpdated', cart);
    changetoggle();
  };

  const handleAddToWishlist = () => {
    const productDetails = { key, img, description1, price, originalPrice, quantity: 1 };
    const Wishcart = JSON.parse(localStorage.getItem('Wish')) || [];
    Wishcart.push(productDetails);
    localStorage.setItem('Wish', JSON.stringify(Wishcart));
    publish('WishcartUpdated', Wishcart);
    changetoggle2();
  };

  const handlestack = () => {
    onLongPress();
  };

 

  return (
    <div className={`product ${isVisible ? 'fade-in' : 'fade-out'}`}>
      <div className="product-card">
        <div style={{ position: 'relative', display: 'inline-block' }}>
        <span className='product-score' style={{ backgroundColor }}>
      {score}%
    </span>
          <img ref={productRef} 
            className={`product-image ${isVisible ? 'visible' : 'hidden'}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchCancel={handleTouchCancel}
            onContextMenu={handleContextMenu}
            src={img}
            alt={name}
          />
          {!buymode ? (
            <div className='wish'>
              <img src={stack} alt="Icon 1" className='wishlist' onClick={handlestack} />
              <img src={like} alt="Icon 2" className='wishlist' onClick={handleAddToWishlist} />
              <img src={info} alt="Icon 3" className='wishlist' onClick={onInfoClick} />
            </div>
          ) : null}
        </div>
        {buymode ? <button className="add-to-cart-button" onClick={handleAddToCart}>Add</button> : null}
        <div className="product-content">
          <h5>{name}</h5>
          <p className="product-description">{description}</p>
          <div className="price-container">
            <span className="original-price">₹{price.toFixed(0)}</span>
            {price !== originalPrice && (
              <>
                <span className="discount-price">₹{originalPrice.toFixed(0)}</span>
                <div className="discount-badge">{discountPercentage}% OFF</div>
              </>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}



export default Product;
