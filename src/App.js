import React, { useState, useEffect, useRef,useCallback } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Product from './Product';
import Tapcloud from './Tapcloud.js'; // Assuming Product.js is in the same directory
import Searches from './Searches.js';
import Toggle from "./Toggle.js";
import Cart from "./Cart.js";
import Wishlist from './Wishlist.js';
import Final from './Final.js';
import Popup from './Popup.js';
import Login from './Login.js';
import Otp from './Otp.js';
import './App.css';
import Order from './Order.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the search icon
import placeholderImage from './images/prod_default.png';
import close from './images/close.png';
import { publish } from './pubsub';
import { subscribe } from './pubsub';
import searchImage from './images/image.svg';
import main from './images/WhatsApp Image 2024-07-03 at 14.07.35_149a3814.jpg';
import mic from './images/mic.svg';
import mi from './images/chatbubble-ellipses.svg';
import line from './images/Line 6.svg';
import Address from './Address.js';
import thumbsUp from './images/Group 130.svg'; // Import the thumbs up image
import thumbsDown from './images/Group 128.svg';
import righticon from './images/Group 131.svg';
import lefticon from './images/Group 132 (2).svg'; // Import the thumbs down image
import mikead from './images/mikeadress.svg'
import homeIcon from './images/home.svg';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const languageDictionary = {
  english: {
    aiAssistant: 'Your AI Commerce Assistance',
    recentSearches: 'Recent Searches',
    placeholder: 'Ask Cartesian',
    chatModeLabel : "Chat", 
    BuyMode : "Buy",
    Wishmode: "Wishlist"
  },
  hindi: {
    aiAssistant: 'आपका एआई वाणिज्य सहायक',
    recentSearches: 'हाल की खोजें',
    placeholder: 'कार्टेशियन से पूछें',
    chatModeLabel : "चैट",
    BuyMode : "बाय",
     Wishmode: " इच्छा-सूची"
  },
  tamil: {
    aiAssistant: 'உங்கள் ஏஐ வர்த்தக உதவி',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    placeholder: 'கார்டேசியனை கேளுங்கள்',
    chatModeLabel :  "அரட்டை",
    BuyMode : "பாய்",
     Wishmode: "விருப்பப்பட்டியல்"
  },
  telugu: {
    aiAssistant: 'మీ ఏఐ వాణిజ్య సహాయం',
    recentSearches: 'ఇటీవలి శోధనలు',
    placeholder: 'కార్టేసియన్‌ని అడగండి',
    chatModeLabel : "చాట్",                        

    BuyMode : "బాయ్",
     Wishmode: "కోరికల జాబితా"
  },
};

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const logoUrl = queryParams.get('logourl') || main; 
  const color = queryParams.get('color') || '#A61E40';
  const initialProducts = [
    { id: 1, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 2, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    { id: 3, name: 'Loading...', img: placeholderImage, description: 'Loading...', price: 0, originalPrice: 0, url: '#', score: '0' },
    // Add more placeholders if needed
  ];
  
  
  const [address, setAddress] = useState(JSON.parse(localStorage.getItem('address')) || {});
  const [activeModel, setActiveModel] = useState('openai');
  const [activelang, setActivelang] = useState(localStorage.getItem('activelang') || 'english');
  const [popupData, setPopupData] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading status
  const [products, setProducts] = useState(initialProducts);
  const [recentSearches, setRecentSearches] = useState([]); // State for recent searches
  const [initialRender, setInitialRender] = useState(true);
  const [tagCloud, setTagCloud] = useState({});
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [imageBytes, setImageBytes] = useState(null);
  const [includeTagCloud, setIncludeTagCloud] = useState(false); 
  const [isBuyMode, setIsBuyMode] = useState(false);  
  const [isWishMode, setIsWishMode] = useState(false); 
  const recognition = useRef(null);
  const inputref = useRef(''); // To store the final transcript
  const fileInputRef = useRef(null);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [isAddressMode, setIsAddressMode] = useState(false); 
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [showPop, setShowPop] = useState(false);
  const [isFinalMode, setIsFinalMode] = useState(false); 
  const [orderResponse, setOrderResponse] = useState(null);
  const [showP,setShowP]=useState(false);
 
  const totalPrice = localStorage.getItem('tp') || 0;

    useEffect(() => {
      const handleCartUpdate = (updatedCart) => {
        setCartItems(updatedCart);
      };
  
      subscribe('cartUpdated', handleCartUpdate);
  
      return () => {
        // Unsubscribe logic can be added here if needed
      };
    }, []);
  const [WishlistItems, setWishItems] = useState(JSON.parse(localStorage.getItem('Wish')) || []);
  const [searchKey, setSearchKey] = useState(0);
  useEffect(() => {
    const handleWishUpdate = (updatedCart) => {
      setWishItems(updatedCart);
    };

    subscribe('WishcartUpdated', handleWishUpdate);

    return () => {
      // Unsubscribe logic can be added here if needed
    };
  }, []);
  const handleProductVisible = useCallback((product_id) => {
    if(!isListening)
    {
      console.log("entry");
    setVisibleProducts((prevVisibleProducts) => {
      const updatedProducts = Array.from(new Set([...prevVisibleProducts, product_id])).slice(-2); // Ensure only last two unique values
      console.log("hiiii",updatedProducts);
      localStorage.setItem('visibleProducts', JSON.stringify(updatedProducts));
      return updatedProducts;
    });}
  }, []);
  
  
  
console.log(visibleProducts);
useEffect(() => {
  const handleMessage = (event) => {
    if (event.data.action === 'open') {
      setIsOpen(true);
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false; // Set continuous to false
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

        setSearchInput(interimTranscript + finalTranscript);
         // Store the final transcript in the ref
      };

      recognition.current.onstart = () => {
        console.log('Voice recognition started');
      };

      recognition.current.onend = () => {
        setTimeout(()=>{  setIsListening(false);
          console.log('Voice recognition ended');
          
          setShowPopup(false);
          // Hide popup when listening ends
         
        
          
          console.log("djbdbfdb",visibleProducts);
        //  storeSearchTerm(document.getElementById("search").value);
          handleSearch(document.getElementById("search").value,false);},4000);
          
       // Use the final transcript to trigger search
      };
    } else {
      console.error('Your browser does not support speech recognition.');
    }
    // Retrieve recent searches from local storage on mount
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    console.log("ser",storedSearches);
    setRecentSearches(storedSearches); 
    const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
    setTagCloud(storedTagCloud);
    const storedBuyMode = JSON.parse(localStorage.getItem('isBuyMode'));
  if (storedBuyMode !== null) {
    setIsBuyMode(storedBuyMode);
  }
  const storedWishMode = JSON.parse(localStorage.getItem('WishMode'));
  if (storedWishMode !== null) {
    setIsWishMode(storedWishMode);
  }

  // Retrieve Chat Mode from local storage if set
  const storedChatMode = JSON.parse(localStorage.getItem('includeTagCloud'));
  if (storedChatMode !== null) {
    setIncludeTagCloud(storedChatMode);
  }    setVisibleProducts((prevVisibleProducts) => {
    const reversedProducts = [...prevVisibleProducts].reverse();
    console.log("First render reversed", reversedProducts);
    localStorage.setItem('visibleProducts', JSON.stringify(reversedProducts));
    return reversedProducts;
  });
    
    handleSearch("saree");
  }, []); // No need to include searchInput here, the effect should only run once

  const toggleModal = () => {
    setIsOpen(!isOpen);
    window.parent.postMessage({ action: 'closeIframe' }, '*');
  };
  const handleToggleChange = (isToggleActive, toggleLabel) => {
    if (toggleLabel === languageDictionary[activelang].BuyMode) {
      setIsBuyMode(isToggleActive);
      localStorage.setItem('isBuyMode', JSON.stringify(isToggleActive)); // Store Buy Mode state
    } else if(toggleLabel === languageDictionary[activelang].chatModeLabel){
      setIncludeTagCloud(isToggleActive); // Update state based on toggle
      localStorage.setItem('includeTagCloud', JSON.stringify(isToggleActive)); // Store Chat Mode state
    }
    else{
      setIsWishMode(isToggleActive); // Update state based on toggle
      localStorage.setItem('WishMode', JSON.stringify(isToggleActive)); 
    }    
  };
  const handleCheckoutClick = () => {
    const loginSessionToken = localStorage.getItem('login_session_token');
    const storedAddress = localStorage.getItem('address'); // Assuming 'address' is the key used to store address details
  
    if (loginSessionToken && storedAddress) {
      setIsOrderMode(true);
    } else if (loginSessionToken && !storedAddress) {
      setIsAddressMode(true);
     
    } else {
      setIsLoginMode(true);
      setIsBuyMode(true);
    }
  };
  const generateOrderRequestId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };
  const handleorderclick=()=>{
    const orderRequestId = generateOrderRequestId();
    const loginSessionToken = localStorage.getItem('login_session_token');
    const phone = localStorage.getItem('phone');
   // const referralId = localStorage.getItem('referral_id') || 'defaultReferralId'; // Assuming referral ID is stored or provide a default value

    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.name,
      sale_price: item.price,
      qty: item.quantity,
    }));

    const requestBody = {
      phone: phone,
      storefront_name: "craftsvilla.com",
      order_request_id: orderRequestId,
      login_session_token: loginSessionToken,
      order_value: totalPrice,
      referral_id: "",
      customer_name: address.customer_name,
      customer_email: address.customer_email,
      address: address,
      order_items: orderItems,
    };

    // API call
    fetch('https://cartesian-api.plotch.io/order/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => response.json())
      .then(data => {
        if (data.api_action_status === "success") {
          // Handle success scenario
          setOrderResponse(data);
                setIsFinalMode(true);
          console.log('Order placed successfully:', data);
          // You can clear the cart or show a success message
        } else {
          // Handle error scenario
          console.error('Failed to place order:', data);
        }
      })
      .catch(error => {
        console.error('Error placing order:', error);
      });

  }
  const generateRandomId = (length) => {
    const digits = '0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += digits[Math.floor(Math.random() * 10)];
    }
    return id;
  };
const handleaddressclick=(addressInput)=>{
  setShowP(true);
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
      const raw = JSON.stringify({
        prompt: addressInput,
        action_intent: "add_address",
        model: "openai",
        language: "en-us"
      });
  
      const requestOptions = {
        method: "POST",
       headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      fetch("https://cartesian-api.plotch.io/address/intent/fetch", requestOptions) // Replace with the actual API endpoint
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.api_action_status === "success") {
            console.log("Address added successfully");
            localStorage.setItem('address', JSON.stringify(data.filters));
            setAddress(JSON.parse(localStorage.getItem('address')));
            setShowP(false);
            setShowPop(true);
          } else {
            console.error("Failed to add address");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      
       
      console.log(raw);
};
const handleConfirm = () => {
   setIsOrderMode(true);
  setShowPop(false);
 
};
const handleClosePop= () => {
  setShowPop(false);
};

  const handleContinueClick = (phone) => {
    setPhone(phone);
    const newLoginRequestId = generateRandomId(10);
    localStorage.setItem('login_request_id', newLoginRequestId);
    localStorage.setItem('phone', phone);

    const raw = JSON.stringify({
      phone: phone,
      storefront_name: "craftsvilla.com",
      login_request_id: newLoginRequestId
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: raw,
      redirect: "follow"
    };

    fetch("https://cartesian-api.plotch.io/login/sendotp", requestOptions) // Replace with the actual API endpointhttps://cartesian-api.plotch.io/order/create/
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(response);
        return response.json();

      })
      .then((data) => {
        console.log(data);
        if (data.api_action_status === "success") {
          console.log("success");
          setIsOtpMode(true);
        } else {
          // Handle error case
          console.error("Failed to send OTP");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    
  };
  const handleLoginClick = (otp) => {
    const loginRequestId = localStorage.getItem('login_request_id');
    const phone=localStorage.getItem('phone')

    const raw = JSON.stringify({
      login_request_id: loginRequestId,
      phone:phone,
      storefront_name: "craftsvilla.com",
      otp:otp
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: raw,
      redirect: "follow"
    };

    fetch("https://cartesian-api.plotch.io/login/signin", requestOptions) // Replace with the actual API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.api_action === "success") {
          const storedAddress = localStorage.getItem('address');
          if(storedAddress)
          {
            setIsOrderMode(true);
          }
          else{
          setIsAddressMode(true);
          }
          localStorage.setItem('login_session_token', data.login_session_token);
            localStorage.setItem('login_session_expiry_time', data.login_session_expiry_time);
            console.log("Login successful:", data);
          // Handle successful login
} else {
          // Handle error case
          console.error("Failed to log in");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const generateRandomNumber = (length) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  };
  
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleKeyPress = (event) => { 
    if (event.key === 'Enter') {
      
      handleSearch(document.getElementById("search").value,false);
      event.target.blur();
      
    }
  };
  const handleInfoClick = (product) => {
    setPopupData(product);
  };

  const handleClosePopup = () => {
    setPopupData(null);
  };

  const handleReaction = (reac) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    const search_i = localStorage.getItem('search_id');
    const session_i = localStorage.getItem('session_id');

    const raw = JSON.stringify({
       search_id: search_i.toString(),
       session_id:session_i.toString(),
      reaction:reac.toString(),
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    console.log(search_i.toString());
    console.log(session_i.toString());
    console.log(reac.toString());
    console.log(2);

    fetch("https://cartesian-api.plotch.io/search/fetch/reaction", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          console.log("done");

          } else {
          console.error("API action status:", data.api_action_status);
        }
       // setInitialRender(false);
        
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        
         // End loading in case of error
      });
  };
  

  const handleSearch = (searchTerm="saree",initialRender="true",imageBytes = null) => {
   
    setSearchInitiated(true);
    if(!initialRender) 
      {
        setIsBuyMode(false);
      }
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        const newSessionId = generateRandomNumber(16);
        console.log(newSessionId);
        localStorage.setItem('session_id', newSessionId);
      }
      const vpp=JSON.parse(localStorage.getItem('visibleProducts') || '[]');
      const sess=localStorage.getItem('session_id');
      console.log(sess);
      const searchId = generateRandomNumber(10);
      localStorage.setItem('search_id', searchId);
      const searchi=localStorage.getItem('search_id');
      console.log(searchId);
    initialRender? setInitialRender(true):setIsLoading(true); // Start loading

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      prompt: imageBytes ? '' : searchTerm,
      image_url: '',
      image_bytes: imageBytes || '',
     action_intent:  imageBytes ? 'search_image_bytes' : 'search',
     model: activeModel,
     chat_mode: includeTagCloud ? "Yes" : "No",
     tag_cloud : includeTagCloud? tagCloud : {}, 
      num_items: "10",
      session_id: sess.toString(),
     search_id:searchi.toString(),
     products_in_viewport:  vpp,

    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://cartesian-api.plotch.io/search/fetch", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if(data.items.length === 0 && data.app_action.action_intent === 'checkout')
        {
           handleCheckoutClick();
        }
        else if (data.items.length === 0 && data.app_action.action_intent === 'save_wishlist') {
          const productId = data.app_action.items;
          const productKey = `product_${productId}`;
          const product = localStorage.getItem(productKey);
        
          if (product) {
            const productDetails =JSON.parse(product);
            const Wishcart = JSON.parse(localStorage.getItem('Wish')) || [];
            Wishcart.push(productDetails);
            localStorage.setItem('Wish', JSON.stringify(Wishcart));
            publish('WishcartUpdated', Wishcart);
           
            setIsWishMode(true);
          } else {
            console.error(`Product with ID ${productId} not found in local storage.`);
          }
        }
        else if(data.items.length === 0 && data.app_action.action_intent === 'add_to_cart')
        {
          const productId = data.app_action.items;
          const productKey = `product_${productId}`;
          const product = localStorage.getItem(productKey);
        
          if (product) {
            const productDetails = JSON.parse(product);

            // Assuming the quantity is part of the search response
            const quantity = Number(data.app_action.qty) || 1; // Use quantity from response or default to 1
        
            // Include quantity in product details
            const updatedProductDetails = {
              ...productDetails,
              quantity: quantity
            };
        
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(updatedProductDetails);
            localStorage.setItem('cart', JSON.stringify(cart));
        
            publish('cartUpdated', cart);
        
            setIsBuyMode(true);
          } else {
            console.error(`Product with ID ${productId} not found in local storage.`);
          }

        }
       else  if (data.api_action_status === "success") {
          const languageMap = {
            hindi: 'hi',
            kannada: 'kn',
            malayalam: 'ml',
            marathi: 'mr',
            tamil: 'ta',
            telugu: 'te',
            english: 'en'
          };
        
          const langSuffix = languageMap[activelang] || 'en'; // Default to English if no match
        
     // Remove all products from local storage that have keys starting with 'product_'
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('product_')) {
    localStorage.removeItem(key);
  }
});

const fetchedProducts = data.items.map((item, index) => ({
  id: index,
  name: (item[`provider_name_${langSuffix}`] || item.provider_name).slice(0, 15), // Default to provider_name if specific language is not available
  img: item.image_link1,
  description: (item[`product_name_${langSuffix}`] || item.product_name).slice(0, 25), // Default to product_name if specific language is not available
  description1: item[`product_name_${langSuffix}`] || item.product_name, // Default to product_name if specific language is not available
  price: parseFloat(item.sale_price),
  url: item.product_url,
  score: item.score,
  product_i: item.product_id,
  originalPrice: parseFloat(item.price),
  isVisible: false // Set isVisible to false for newly fetched products
}));

// Store each product individually in local storage using its product_id as the key, prefixed with 'product_'
fetchedProducts.forEach(product => {
  localStorage.setItem(`product_${product.product_i}`, JSON.stringify(product));
});


          // Convert description to title case
          fetchedProducts.forEach((product) => {
            product.description = product.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            product.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });
          const sortedProducts = [...fetchedProducts].sort((a, b) => b.score - a.score);
          console.log(sortedProducts)
          setProducts(sortedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== ""  &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
          // Store the search term in local storage
             if (searchTerm !== "saree" && searchTerm!=="") {
            storeSearchTerm(searchTerm || searchInput);
          }
          console.log(data.tag_cloud)
          
        } else {
          console.error("API action status:", data.api_action_status);
        }
       // setInitialRender(false);
        setIsLoading(false); // End loading
        setSearchInitiated(false); 
        setInitialRender(false); 
        setSearchKey(prevKey => prevKey + 1);
        if(data.items.length !== 0 && data.app_action.action_intent !== 'save_wishlist')
        {
        setIsWishMode(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        
        setIsLoading(false); // End loading in case of error
      });

    console.log("Search input:", searchTerm); // Log the search term
    console.log("Request options:", requestOptions);
    console.log("raw",raw)
    

    
  };

  const storeSearchTerm = (term) => {
    if(term !== "saree" && term!=="")
      {
        console.log("searchhh",recentSearches);
    const updatedSearches = [term, ...recentSearches.filter(search => search !== term)].slice(0, 3);
    console.log(updatedSearches);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
  };

  const handleRecentSearchClick = (term) => {
    setSearchInput(term);
    handleSearch(term,false);
  };

  const handleLongPressSearch = (product) => {
    if(!initialRender) 
      {
        setIsBuyMode(false)
      }
    console.log(product);
    const vpp=JSON.parse(localStorage.getItem('visibleProducts') || '[]');
    const searchId = generateRandomNumber(10);
      localStorage.setItem('search_id', searchId);
      const searchi=localStorage.getItem('search_id');
    setIsLoading(true); // Start loading
    const sess=localStorage.getItem('session_id');
    console.log(sess);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    
    const raw = JSON.stringify({
      prompt:  product.description,
      image_url: product.img,
      action_intent: "search_image",
      model: activeModel,
      chat_mode: includeTagCloud ? "Yes" : "No",
      tag_cloud : includeTagCloud? tagCloud : {}, 
       num_items: "10",
       session_id: sess.toString(),
       product_id: product.product_i,
       search_id:searchi.toString(),
       products_in_viewport:  vpp,
       
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://cartesian-api.plotch.io/search/fetch", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          const languageMap = {
            hindi: 'hi',
            kannada: 'kn',
            malayalam: 'ml',
            marathi: 'mr',
            tamil: 'ta',
            telugu: 'te',
            english: 'en'
          };
        
          const langSuffix = languageMap[activelang] || 'en'; // Default to English if no match
        
          const fetchedProducts = data.items.map((item, index) => ({
            id: index,
            name: (item[`provider_name_${langSuffix}`] || item.provider_name).slice(0,15), // Default to provider_name if specific language is not available
            img: item.image_link1,
            description: (item[`product_name_${langSuffix}`] || item.product_name).slice(0,25), // Default to product_name if specific language is not available
            description1: item[`product_name_${langSuffix}`] || item.product_name, // Default to product_name if specific language is not available
            price: parseFloat(item.sale_price),
            url: item.product_url,
            score: item.score,
            product_i: item.product_id,
            originalPrice: parseFloat(item.price),
            isVisible: false // Set isVisible to false for newly fetched products
          }));
          fetchedProducts.forEach((produc) => {
            produc.description = produc.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            produc.name = produc.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });

          setProducts(fetchedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== ""  &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
        } else {
          console.error("API action status:", data.api_action_status);
        }
        
        setIsLoading(false); // End loading
        setSearchKey(prevKey => prevKey + 1);
        if(data.items.length !== 0 && data.app_action.action_intent !== 'save_wishlist')
          {
          setIsWishMode(false);
          }
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        setIsLoading(false); // End loading in case of error
      });

    console.log("Long press search input:", prompt); // Log the search term
    console.log("Request options:", requestOptions);
    console.log("jnvjsdn:",searchi);
    console.log(product.product_i);
  };

  
  const handleDoubleClickSearch = (product) => {
    if(!initialRender) 
      {
        setIsBuyMode(false)
      }
      const searchId = generateRandomNumber(10);
      localStorage.setItem('search_id', searchId);
      const searchi=localStorage.getItem('search_id');
    setIsLoading(true);
    console.log("hjfbgfb",product);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const sess=localStorage.getItem('session_id');
    console.log(sess);
    const vpp=JSON.parse(localStorage.getItem('visibleProducts') || '[]');

    const raw = JSON.stringify({
      prompt: product.description,
      image_url: product.img,
      price: product.price,
      action_intent: "search_price",
      model: activeModel,
      chat_mode: includeTagCloud ? "Yes" : "No",
      tag_cloud : includeTagCloud? tagCloud : {}, 
       num_items: "10",
       session_id: sess.toString(),
       search_id:searchi.toString(),
       products_in_viewport:  vpp,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://cartesian-api.plotch.io/search/fetch", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.api_action_status === "success") {
          const languageMap = {
            hindi: 'hi',
            kannada: 'kn',
            malayalam: 'ml',
            marathi: 'mr',
            tamil: 'ta',
            telugu: 'te',
            english: 'en'
          };
        
          const langSuffix = languageMap[activelang] || 'en'; // Default to English if no match
        
          const fetchedProducts = data.items.map((item, index) => ({
            id: index,
            name: (item[`provider_name_${langSuffix}`] || item.provider_name).slice(0,15), // Default to provider_name if specific language is not available
            img: item.image_link1,
            description: (item[`product_name_${langSuffix}`] || item.product_name).slice(0,25), // Default to product_name if specific language is not available
            description1: item[`product_name_${langSuffix}`] || item.product_name, // Default to product_name if specific language is not available
            price: parseFloat(item.sale_price),
            url: item.product_url,
            score: item.score,
            product_i: item.product_id,
            originalPrice: parseFloat(item.price),
            isVisible: false // Set isVisible to false for newly fetched products
          }));

          fetchedProducts.forEach((produc) => {
            produc.description = produc.description.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            product.name = produc.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          });

          setProducts(fetchedProducts);
          const storedTagCloud = JSON.parse(localStorage.getItem('tagCloud')) || {};
         

        // Update the stored tag cloud with new key-value pairs from the API response
        const updatedTagCloud = { ...storedTagCloud };
        console.log(updatedTagCloud)
        console.log(data.tag_cloud) 

        Object.keys(data.tag_cloud).forEach((key) => {
          // Only update if new value is not empty and stored value is empty or doesn't exist
          if (data.tag_cloud[key] !== "" &&  data.tag_cloud[key] !== "0") {
            updatedTagCloud[key] = data.tag_cloud[key];
          }
        });

        // Store the updated tag cloud in local storage
        console.log(updatedTagCloud)
        localStorage.setItem('tagCloud', JSON.stringify(updatedTagCloud));

        // Update the state with the new tag cloud
         
        setTagCloud(updatedTagCloud);
        } else {
          console.error("API action status:", data.api_action_status);
        }
        
        setIsLoading(false);
        setSearchKey(prevKey => prevKey + 1);
        if(data.items.length)
          if(data.items.length !== 0 && data.app_action.action_intent !== 'save_wishlist')
            {
            setIsWishMode(false);
            }
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        setIsLoading(false);
      });

    console.log("Double-clicked product:", product.description);
    console.log("Request options:", requestOptions);
    
    console.log(product.img);
console.log(product.description);
console.log(product.price);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
      setShowPopup(false); // Hide popup when stopped manually
    } else {
      recognition.current.start();
      setShowPopup(true); // Show popup when starting
    }
    setIsListening(!isListening);
    
  };
  const handleTagClick = (searchQuery) => {
    console.log(searchQuery);
    
    handleSearch(searchQuery, false);
    setSearchInput("");
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        console.log(base64String)
        setImageBytes(base64String); // Store the base64 string in the state
        handleSearch("", false, base64String); // Trigger the search with the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearchClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input click event
    }
  };
  const handlelangButtonClick = (lang) => {
    localStorage.setItem('activelang', lang); // Store selected language in local storage
    setActivelang(lang);
  };
  const handletogglePressSearch=()=> {
    setIsBuyMode(true);
   
  }
  const handletogglePressSearch2=()=> {
    setIsWishMode(true);
    
  }
 
  const CustomPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: 'block', background: 'none' }}
        onClick={onClick}
      >
        <img src={lefticon} alt="Previous" style={{ width: '30px', height: '30px' }} className='slickimgl'/>
      </div>
    );
  };
  
  const CustomNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: 'block', background: 'none' }}
        onClick={onClick}
      >
        <img src={righticon} alt="Next" style={{ width: '30px', height: '30px' }} className='slickimg' />
      </div>
    );
  };
  
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    draggable: true,
    centerMode: true,
    centerPadding: '5%',
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      }
    ]
  };

  return (
   
    <div className="page-container">
     
    


      {isOpen && (
        <div   className="modal-overlay">
          <div className="modal-content">
            <div className="one">
            <img src={logoUrl} alt="AI Assistance" className="ai-assistance-image" />
              <p>{languageDictionary[activelang].aiAssistant}</p>
              <span><img className="sec" src={close} alt="cross" onClick={toggleModal} /></span>
            </div>
            <div className='lang'>
            <button
                  className={`english ${activelang === 'english' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('english')}
                >
                  English
                </button>
                <button
                  className={`hindi ${activelang === 'hindi' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('hindi')}
                >
                  Hindi
                </button>
                <button
                  className={`tamil ${activelang === 'tamil' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('tamil')}
                >
                  தமிழ்
                </button>
                <button
                  className={`telugu ${activelang === 'telugu' ? 'active' : ''}`}
                  onClick={() => handlelangButtonClick('telugu')}
                >
                  తెలుగు
                </button>
                </div>
                
            <div className="similar-products">
              <Slider key={searchKey} {...settings}>
                {products.map((product) => (
                  <Product 
                   product_id={product.product_i}
                    key={product.id} 
                    {...product} 
                    url={product.url} // Pass the product URL to the Product component
                    
                    score={product.score}
                    buymode={isBuyMode}
                    onLongPress={() => handleLongPressSearch(product)} 
                    onDoubleClick={() => handleDoubleClickSearch(product)}
                    changetoggle={ handletogglePressSearch}
                    changetoggle2={ handletogglePressSearch2}
                    onInfoClick={() => handleInfoClick(product)}
                    onProductVisible={handleProductVisible}

                    
                  />
                ))}
              </Slider>
              <div className="search-bar-container">
                <input
                  type="text"
                  id="search"
                  placeholder={languageDictionary[activelang].placeholder}
                  className="search-bar"
                  value={searchInput}
                  onKeyPress={handleKeyPress}
                  onChange={handleSearchInputChange}
                  ref={inputref}
                />
                <FontAwesomeIcon icon={faSearch} id="searchic" className="search-icon" onClick={() => handleSearch(searchInput,false)} />
                <img className="s-i" src={searchImage} alt="Search" onClick={handleImageSearchClick} />
                <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }} // Hide the file input
          onChange={handleImageUpload} // Handle image upload
        />
                 
              </div>
              <div className='image-cont'>
              <img src={thumbsUp} alt="Thumbs Up" className='thumbs-up' onClick={() => handleReaction(1)} /> 
              <div className='ellipse mike' onClick={toggleListening} style={{ backgroundColor: color }}> </div>

              <img src={mic} alt="" className='mik' onClick={toggleListening} />
              <img src={thumbsDown} alt="Thumbs Down" className='thumbs-down' onClick={() => handleReaction(0)}/>
              </div>
             
              <div className='cmt'>
              <Toggle label={languageDictionary[activelang].chatModeLabel} onToggleChange={handleToggleChange}  defaultChecked={includeTagCloud}/>
              <Toggle label={languageDictionary[activelang].BuyMode} onToggleChange={handleToggleChange} defaultChecked={isBuyMode}/>
              <Toggle label={languageDictionary[activelang].Wishmode} onToggleChange={handleToggleChange} defaultChecked={isWishMode}/>
              </div>
              <img src={line} alt="" className='line'/>
              {isFinalMode ? (
        <Final  onPlaceClick={handleorderclick}  orderId={orderResponse.order_id}/>
      ) : 
              isOrderMode ? (
        <Order color={color} onPlaceClick={handleorderclick}  />
      ) : 
              isAddressMode ? (
        <Address color={color} onaddressclick={handleaddressclick} />
      ) : isOtpMode ? (
        <Otp color={color} onLoginClick={handleLoginClick}  />
      ) : isLoginMode ? (
        <Login color={color} onContinueClick={handleContinueClick}/>
        
      ) : isBuyMode ? (
  <Cart color={color} onCheckoutClick={handleCheckoutClick} />
) : isWishMode ? (
  <Wishlist color={color} />
) : (
  <div className="recent-searches">
    <Searches
      recentSearches={recentSearches}
      onRecentSearchClick={handleRecentSearchClick}
      lang={activelang}
    />
    <div className="tapcloud-container">
      <Tapcloud
        tag_cloud={tagCloud}
        onTagClick={handleTagClick}
        searchInitiated={searchInitiated}
        lang={activelang}
      />
    </div>
  </div>
)}

            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="popup">
          <p>Please speak now...</p>
        </div>
      )}
      {showP && (
        <div className="popup">
          <p>Updating Address...</p>
        </div>
      )}
      {initialRender && isOpen &&(
        <div className="popup">
          <p>"Your AI Search Agent for ONDC Network"</p>
         
        </div>
        
      )}
      {isLoading && (
        <div className="popup">
          <p>"Our AI is fetching best products for you"...</p>
        </div>
      )}
      {popupData && (
        <Popup
          image={popupData.img}
          name={popupData.description1}
          onClose={handleClosePopup}
        />
      )}
      {showPop && (
        <div className="pop">
     
          <h2 className='ad-text'>Address</h2>
          <button className="popup-close" onClick={handleClosePop}>✖</button>
          <div className="address-content">
            <img src={homeIcon} alt="Home Icon" className="home-icon" />
            <div className="address-details">
              <p className='pincode'>{address.pincode}-Home</p>
              <p className='add-det'> {address.house_number && `${address.house_number}, `}
                {address.locality && `${address.locality}, `}
                {address.city && `${address.city}, `}
                {address.state && `${address.state}, `}
                {address.country && `${address.country}`}</p>
              <p className='phonn'> {`${address.customer_name} (${phone})`}</p>
              <p className='edit-delete'>
                <span className="edit-link">Edit</span>   <span className="pipe">|</span> <span className="delete-link">Delete</span>
              </p>
              <div className="confirm-action">
                <button className="confirm-button" onClick={handleConfirm} style={{ backgroundColor: color }}>Confirm</button>
                <img src={mikead} alt="Mic" className="mic-ico" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}

export default App;
