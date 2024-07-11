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
import Popup from './Popup.js';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the search icon
import placeholderImage from './images/prod_default.png';
import close from './images/close.png';

import searchImage from './images/image.svg';
import main from './images/WhatsApp Image 2024-07-03 at 14.07.35_149a3814.jpg';
import mic from './images/mic.svg';
import mi from './images/chatbubble-ellipses.svg';
import line from './images/Line 6.svg';
import thumbsUp from './images/Group 130.svg'; // Import the thumbs up image
import thumbsDown from './images/Group 128.svg'; // Import the thumbs down image


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const languageDictionary = {
  english: {
    aiAssistant: 'Your AI Commerce Assistance',
    recentSearches: 'Recent Searches',
    placeholder: 'Ask Cartesian',
    chatModeLabel : "Chat Mode",
    BuyMode : "Buy Mode",
    Wishmode: "Wish Mode"
  },
  hindi: {
    aiAssistant: 'आपका एआई वाणिज्य सहायक',
    recentSearches: 'हाल की खोजें',
    placeholder: 'कार्टेशियन से पूछें',
    chatModeLabel : "चैट मोड",
    BuyMode : "बाय मोड",
     Wishmode: "विश मोड"
  },
  tamil: {
    aiAssistant: 'உங்கள் ஏஐ வர்த்தக உதவி',
    recentSearches: 'சமீபத்திய தேடல்கள்',
    placeholder: 'கார்டேசியனை கேளுங்கள்',
    chatModeLabel :  "அரட்டை முறை",
    BuyMode : "பாய் மோடு",
     Wishmode: "விருப்ப முறை"
  },
  telugu: {
    aiAssistant: 'మీ ఏఐ వాణిజ్య సహాయం',
    recentSearches: 'ఇటీవలి శోధనలు',
    placeholder: 'కార్టేసియన్‌ని అడగండి',
    chatModeLabel : "చాట్ మోడ్",                        

    BuyMode : "బాయ్ మోడ్",
     Wishmode: "కోరిక మోడ్ "
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
  
  
  
  const [activeModel, setActiveModel] = useState('openai');
  const [activelang, setActivelang] = useState(localStorage.getItem('activelang') || 'english');
  const [popupData, setPopupData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleProductVisible = useCallback((product_id) => {
    setVisibleProducts((prevVisibleProducts) => {
      const updatedProducts = Array.from(new Set([...prevVisibleProducts, product_id])).slice(-2); // Ensure only last two unique values
      return updatedProducts;
    });
  }, []);
  
  
  
console.log(visibleProducts);
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
        console.log('Voice recognition ended');
        
        setShowPopup(false);
        // Hide popup when listening ends
       
      
        
        
        handleSearch(document.getElementById("search").value,false); // Use the final transcript to trigger search
      };
    } else {
      console.error('Your browser does not support speech recognition.');
    }
    // Retrieve recent searches from local storage on mount
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
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
  }
    
    handleSearch("saree");
  }, []); // No need to include searchInput here, the effect should only run once

  const toggleModal = () => {
    setIsOpen(!isOpen);
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
     products_in_viewport:  visibleProducts,

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
    const updatedSearches = [term, ...recentSearches.filter(search => search !== term)].slice(0, 3);
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
       products_in_viewport:  visibleProducts,
       
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
            produc.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
       products_in_viewport:  visibleProducts,
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
            product.name = product.name.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
     
    <div className={`tg ${isOpen ? 'hidden' : ''}`}>
    <div className='ellipse mike' onClick={toggleModal} style={{ backgroundColor: color }}></div>
  <img src={mi} alt="" className='mi' onClick={toggleModal} />
</div>


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
              <Slider {...settings}>
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
              {isBuyMode ? (
  <Cart color={color} />
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
      {initialRender && isOpen &&(
        <div className="popup">
          <p>Khojle: Jo Chahiye Woh Payiye</p>
         
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
    </div>
    
  );
}

export default App;
