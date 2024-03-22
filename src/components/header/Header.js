import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { BsShopWindow } from 'react-icons/bs';
import { BiUserCircle } from 'react-icons/bi';
import { MdSearch, MdGTranslate, MdOutlineAccountCircle, MdNotificationsActive } from "react-icons/md";
import { IoNotificationsOutline, IoHeartOutline, IoCartOutline, IoPersonOutline, IoDiscOutline } from 'react-icons/io5';
import { IoMdArrowDropdown, IoIosArrowDown } from "react-icons/io";
import { GoLocation } from 'react-icons/go';
import { FiMenu, FiFilter } from 'react-icons/fi';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Location from '../location/Location';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { ActionTypes } from '../../model/action-type';
import Login from '../login/Login';
import Cookies from 'universal-cookie';
import Cart from '../cart/Cart';
import { toast } from 'react-toastify';
import Favorite from '../favorite/Favorite';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

import { setCity } from "../../model/reducer/locationReducer";
import { setPaymentSetting } from '../../model/reducer/settingReducer';
import { setCart } from "../../model/reducer/cartReducer";
import { setLanguage, setLanguageList } from "../../model/reducer/languageReducer";
import { setNotification } from "../../model/reducer/notificationReducer";
import { setFavourite } from "../../model/reducer/favouriteReducer";
import { setFilterBrands, setFilterCategory, setFilterMinMaxPrice, setFilterSearch } from "../../model/reducer/productFilterReducer";
import { Modal } from 'antd';
// import { Modal } from "react-bootstrap";
import "../location/location.css";

const Header = () => {

    const [isLocationPresent, setisLocationPresent] = useState(false);
    const [totalNotification, settotalNotification] = useState(null);
    const [isDesktopView, setIsDesktopView] = useState(window.innerWidth > 768);
    const [search, setsearch] = useState("");

    const locationModalTrigger = useRef();
    const closeSidebarRef = useRef();
    const searchNavTrigger = useRef();


    const navigate = useNavigate();
    const dispatch = useDispatch();

    const city = useSelector(state => (state.city));
    const cssmode = useSelector(state => (state.cssmode));
    const user = useSelector(state => (state.user));
    const cart = useSelector(state => (state.cart));
    const favorite = useSelector(state => (state.favourite));
    const setting = useSelector(state => (state.setting));
    const [isSticky, setIsSticky] = useState(false);
    const languages = useSelector((state) => (state.language));
    const [showModal, setShowModal] = useState(false);
    const [bodyScroll, setBodyScroll] = useState(false);
    const [locModal, setLocModal] = useState(false);

    const { t } = useTranslation();

    //initialize cookies
    const cookies = new Cookies();

    const curr_url = useLocation();

    // to open Location modal 
    const openModal = () => {
        handleModal();
    };

    const openCanvasModal = () => {
        handleModal();
        closeSidebarRef.current.click();
    };

    useEffect(() => {
        if (bodyScroll) {
            document.body.style.overflow = 'auto';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';

        }
    }, [bodyScroll]);


    const handleModal = () => {
        setLocModal(true);
        setBodyScroll(true);
    };

    useEffect(() => {
        // console.log('status',city)
        // setLocModal(true);
        // setLocModal(false);
        if (!city.status === "fulfill") {
            handleModal();
        }
    }, []);

    useEffect(() => {

        if (setting.setting?.default_city && !city.city) {

            setisLocationPresent(true);
            api.getCity(parseFloat(setting.setting.default_city?.latitude), parseFloat(setting.setting.default_city?.longitude))
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        // dispatch({ type: ActionTypes.SET_CITY, payload: result.data });
                        dispatch(setCity({ data: result.data }));
                    }
                });
            setisLocationPresent(true);
        }
        else if (!setting.setting?.default_city && !city.city) {
            // locationModalTrigger.current.click();
            // setLocModal(true)
        }
    }, [setting]);


    useEffect(() => {
        api.getSystemLanguage(0, 0)
            .then((response) => response.json())
            .then((result) => {
                // dispatch({ type: ActionTypes.SET_LANGUAGE_LIST, payload: result.data });
                dispatch(setLanguageList({ data: result.data }));
            });
    }, []);

    const fetchCart = async (token, latitude, longitude) => {
        await api.getCart(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // dispatch({ type: ActionTypes.SET_CART, payload: result });
                    dispatch(setCart({ data: result }));
                }
                else {
                    // dispatch({ type: ActionTypes.SET_CART, payload: null });
                    dispatch(setCart({ data: null }));
                }
            })
            .catch(error => console.log(error));



    };

    const fetchFavorite = async (token, latitude, longitude) => {
        await api.getFavorite(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // dispatch({ type: ActionTypes.SET_FAVORITE, payload: result });
                    dispatch(setFavourite({ data: result }));
                }
                else {
                    dispatch(setFavourite({ data: null }));
                    // dispatch({ type: ActionTypes.SET_FAVORITE, payload: null });
                }
            })
            .catch(error => console.log(error));
    };

    const fetchNotification = async (token) => {
        await api.getNotification(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: result.data });
                    dispatch(setNotification({ data: result.data }));
                    result.total > 0 ? settotalNotification(result.total) : settotalNotification(null);
                }
            })
            .catch(error => console.log(error));
    };

    useEffect(() => {
        if (city.city !== null && cookies.get('jwt_token') !== undefined && user.user !== null) {
            fetchCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude);
            fetchFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude);
            fetchNotification(cookies.get('jwt_token'));
        }

    }, [city, user]);


    const fetchPaymentSetting = async () => {
        await api.getPaymentSettings(cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setPaymentSetting({ data: JSON.parse(atob(result.data)) }));
                    // dispatch(setPaymentSetting({ data: result.data }));
                }
            })
            .catch(error => console.log(error));
    };

    const handleChangeLanguage = (id) => {
        api.getSystemLanguage(id, 0)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    document.documentElement.dir = result.data.type;
                    // dispatch({ type: ActionTypes.SET_LANGUAGE, payload: result.data });
                    dispatch(setLanguage({ data: result.data }));
                }
            });
    };


    useEffect(() => {
        fetchPaymentSetting();
        dispatch(setFilterSearch({ data: null }));
        // window.addEventListener("scroll", handleScroll);
        // return () => {
        //     window.removeEventListener("scroll", handleScroll);
        // };


    }, []);
    const handleScroll = () => {
        if (window.pageYOffset > 0) {
            setIsSticky(true);
        } else {
            setIsSticky(false);
        }
    };
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };
    const handleResize = () => {
        setIsDesktopView(window.innerWidth > 768);
    };
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    // console.log(isDesktopView)
    const [mobileNavActKey, setMobileNavActKey] = useState(null);
    const handleMobileNavActKey = (key) => {
        setMobileNavActKey(key == mobileNavActKey ? null : key);
    };
    return (
        <>
            {/* sidebar */}
            <div className="hide-desktop offcanvas offcanvas-start" tabIndex="-1" id="sidebaroffcanvasExample" aria-labelledby="sidebaroffcanvasExampleLabel">
                <div className='site-scroll ps'>

                    <div className="canvas-header">
                        <div className='site-brand'>
                            <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo"></img>
                        </div>

                        <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeSidebarRef}><AiOutlineCloseCircle fill='black' /></button>
                    </div>
                    <div className="canvas-main">
                        <div className={isDesktopView ? "site-location " : "site-location d-none"}>
                            <button whiletap={{ scale: 0.8 }} type='buton' onClick={openCanvasModal} >
                                <div className='d-flex flex-row gap-2'>
                                    <div className='icon location p-1 m-auto'>
                                        <GoLocation fill='black' />
                                    </div>
                                    <div className='d-flex flex-column flex-grow-1'>
                                        <span className='location-description'>{t("deliver_to")} <IoMdArrowDropdown /></span>
                                        <span className='current-location'>{isLocationPresent
                                            ? (
                                                <>
                                                    {city.status === 'fulfill'
                                                        ? city.city.formatted_address
                                                        : (
                                                            <div className="d-flex justify-content-center">
                                                                <div className="spinner-border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                </>)
                                            : t("select_location")
                                        }</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <nav className='canvas-menu canvas-primary vertical'>
                            <ul id='menu-menu-1' className='menu'>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/');
                                    }}>{t("home")}</button>
                                </li>

                                <li className='dropdown mega-menu menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children' >
                                    <button type="button" >
                                        {t("shop")}
                                    </button>
                                    <ul className="sub-menu dropdown-menu" aria-labelledby="ShopDropDown">
                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                if (user.user) {
                                                    closeSidebarRef.current.click();
                                                    navigate('/cart');
                                                } else {
                                                    toast.error(t('required_login_message_for_cartRedirect'));
                                                }
                                            }}>{t("cart")}</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                if (user.user) {
                                                    closeSidebarRef.current.click();
                                                    navigate('/checkout');
                                                } else {
                                                    toast.error(t('required_login_message_for_checkout'));
                                                }
                                            }}>{t("checkout")}</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                if (user.user) {

                                                    closeSidebarRef.current.click();
                                                    navigate('/profile');
                                                } else {
                                                    toast.error(t('required_login_message_for_profile'));
                                                }
                                            }}>{t("myAccount")}</button>
                                        </li>

                                        <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button' onClick={() => {
                                                if (user.user) {

                                                    closeSidebarRef.current.click();
                                                    navigate('/wishlist');
                                                } else {
                                                    toast.error(t('required_login_message_for_wishlist'));
                                                }
                                            }}>{t("wishList")}</button>
                                        </li>

                                        {/* <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                            <button type='button'>Order Tracking</button>
                                        </li> */}
                                    </ul>
                                    <button className='menu-dropdown' id="ShopDropDown" type='button' data-bs-toggle="dropdown" aria-expanded="false">
                                        <IoIosArrowDown />
                                    </button>
                                </li>

                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/about');
                                    }}>{t('about_us')}</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/contact');
                                    }}>{t('contact_us')}</button>
                                </li>
                                <li className=' menu-item menu-item-type-post_type menu-item-object-page'>
                                    <button type='button' onClick={() => {
                                        closeSidebarRef.current.click();
                                        navigate('/faq');
                                    }}>{t('faq')}</button>
                                </li>
                                <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                    <button type='button' onClick={() => {
                                        if (user.user) {

                                            closeSidebarRef.current.click();
                                            navigate('/notification');
                                        } else {
                                            toast.error(t('required_login_message_for_notification'));
                                        }
                                    }}>{t("notification")}</button>
                                </li>

                            </ul>


                            <div className='lang-mode-utils'>
                                <div className='language-container bg-white' >
                                    <MdGTranslate size={24} />
                                    <Dropdown>
                                        <Dropdown.Toggle>
                                            {languages.current_language && languages.current_language.name}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {languages.available_languages && languages.available_languages.map((language, index) => {
                                                return (
                                                    <Dropdown.Item key={index} onClick={() => { handleChangeLanguage(language.id); }}>{language.name}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>

                                </div>
                                {/* <div className='util'>
                                    <span>Select Mode</span>
                                    <select className='' onChange={handleCssModeChange}>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div> */}

                            </div>
                        </nav>
                    </div>
                </div>

            </div>

            {/* header */}
            <header className='site-header  desktop-shadow-disable mobile-shadow-enable bg-white  mobile-nav-enable border-bottom'>


                {/* top header */}
                <div className={`header-top  hide-mobile ${(cssmode.cssmode === "dark") ? "dark-header-top" : ''}`}>
                    <div className="container">
                        <div className={`row justify-content-between`}>
                            <div className='col-md-6 d-flex justify-content-start align-items-center'>
                                <Link to='/about' className={`borderPad ${(cssmode.cssmode === "dark") ? "dark-header-1" : ''}`} > {t('about_us')}</Link>
                                <Link to='/contact' className={`borderPad`} > {t('contact_us')}</Link>
                                <Link to='/faq' className={`borderPad`} >{t('faq')}</Link>
                            </div>
                            <div className='col-md-6 d-flex justify-content-end'>
                                {/* 2nd Phase feature */}
                                {/* <div className='d-flex px-2 border-start'>
                                    <div>
                                        <IoContrast className='fs-3' />
                                    </div>
                                    <select className='p-2' onChange={handleCssModeChange}>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div> */}

                                <div className='language-container bg-white' >
                                    <Dropdown>
                                        <Dropdown.Toggle>
                                            <MdGTranslate size={20} className='me-2' />
                                            {languages.current_language && languages.current_language.name}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {languages.available_languages && languages.available_languages.map((language, index) => {
                                                return (
                                                    <Dropdown.Item key={index} onClick={() => { handleChangeLanguage(language.id); }}>{language.name}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* bottom header */}
                <div className={isSticky ? "sticky header-main  w-100" : "header-main  w-100"}>
                    <div className="container">
                        <div className='d-flex row-reverse justify-content-lg-between justify-content-center'>

                            <div className='d-flex w-auto align-items-center justify-content-start col-md-2 order-1 column-left '>

                                <div className='header-buttons hide-desktop' >

                                    <button className='header-canvas button-item' type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebaroffcanvasExample" aria-controls="sidebaroffcanvasExample">
                                        <div className='button-menu'>
                                            <FiMenu />
                                        </div>
                                    </button>


                                </div>


                                <Link to='/' className='site-brand' style={curr_url.pathname === '/profile' ? { marginLeft: '4px' } : null}>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo" className='desktop-logo hide-mobile' />
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} height="70px" alt="logo" className='mobile-logo hide-desktop' />

                                </Link>
                            </div>


                            <div className='d-flex  w-lg-100 col-md-6 order-2 justify-content-center align-items-center '>

                                {/* location modal trigger button */}
                                {/* <button whiletap={{ scale: 0.6 }} type='buton' className='header-location site-location hide-mobile'
                                >
                                    <div className='d-flex flex-row gap-2'>
                                        <div className='icon location p-1 m-auto'>
                                            <GoLocation />
                                        </div>
                                        <div className='d-flex flex-column flex-grow-1 align-items-start' >
                                            <span className='location-description'>{t('deliver_to')} <IoMdArrowDropdown /></span>
                                            <span className='current-location' onClick={() => { setisLocationPresent(true); setShowModal(true); }}>
                                                <>
                                                    {city.status === 'fulfill'
                                                        ? city.city.formatted_address
                                                        : (
                                                            t("select_location")
                                                        )}
                                                </>
                                            </span>
                                        </div>
                                    </div>
                                </button> */}
                                <button whiletap={{ scale: 0.6 }} type='buton' className='header-location site-location hide-mobile' onClick={openModal}>
                                    <div className='d-flex flex-row gap-2'>
                                        <div className='icon location p-1 m-auto'>
                                            <GoLocation fill='black' />
                                        </div>
                                        <div className='d-flex flex-column flex-grow-1 align-items-start' >
                                            <span className='location-description'>{t('deliver_to')} <IoMdArrowDropdown /></span>
                                            <span className='current-location'>
                                                <>
                                                    {city.status === 'fulfill'
                                                        ? city.city.formatted_address
                                                        : (
                                                            t("select_location")
                                                        )}
                                                </>
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                <div className={`header-search rounded-3 ${mobileNavActKey == 2 ? "active" : ""}`}>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        if (search !== "") {
                                            dispatch(setFilterSearch({ data: search }));
                                            // dispatch(setFilterCategory({ data: null }));
                                            // dispatch(setFilterBrands({ data: [] }));
                                            // dispatch(setFilterMinMaxPrice({ data: null }));
                                            searchNavTrigger.current.click();
                                            navigate('/products');
                                            // if (curr_url.pathname !== '/products') {
                                            // }
                                        }

                                    }}

                                        className='search-form'>
                                        <input type="search"
                                            id="search-box"
                                            value={search}
                                            placeholder={t('enter_text_to_search_products')}
                                            className=''
                                            onChange={(e) => {
                                                setsearch(e.target.value);
                                            }}

                                        />

                                        <button type='submit'>
                                            <MdSearch fill='white' />
                                        </button>
                                    </form>
                                </div>


                            </div>


                            <div className='d-flex col-md-3 w-auto order-3  justify-content-end align-items-center'>
                                <button type='button' whiletap={{ scale: 0.6 }} className='icon position-relative hide-mobile mx-sm-4' onClick={() => {
                                    if (cookies.get('jwt_token') === undefined) {
                                        toast.error(t("required_login_message_for_notification"));
                                    }
                                    else {
                                        navigate('/notification');
                                    }
                                }}>
                                    {totalNotification === null ? <IoNotificationsOutline />
                                        : <MdNotificationsActive fill="var(--secondary-color)" />}

                                </button>

                                {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button whiletap={{ scale: 0.6 }} className='icon mx-sm-4 position-relative hide-mobile-screen'
                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error(t("required_login_message_for_cartRedirect"));
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!");
                                            }
                                        }}>
                                        <IoHeartOutline className='' />
                                    </button>
                                    : <button whiletap={{ scale: 0.6 }} className='icon mx-4 position-relative hide-mobile-screen'
                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error(t("required_login_message_for_cartRedirect"));
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!");
                                            } else {
                                                navigate("/wishlist");
                                            }
                                        }}>
                                        {/* {console.log("this runned")} */}
                                        <IoHeartOutline className='' />

                                        {favorite.favorite && favorite.favorite.status !== 0 && favorite.favorite !== null ?
                                            <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5 ">
                                                {favorite.favorite.total}
                                                <span className="visually-hidden">unread messages</span>
                                            </span>
                                            : null}

                                    </button>
                                }

                                {/* {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button type='button' whiletap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative'

                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error(t("required_login_message_for_cartRedirect"));
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!");
                                            }
                                        }}>
                                        <IoCartOutline />
                                    </button>

                                    : <button type='button' whiletap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample"

                                        onClick={() => {
                                            if (cookies.get('jwt_token') === undefined) {
                                                toast.error(t("required_login_message_for_cartRedirect"));
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!");
                                            }
                                        }}>
                                        <IoCartOutline />

                                        {cart.cart !== null ?
                                            <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5">
                                                {cart.cart.total}
                                                <span className="visually-hidden">unread messages</span>
                                            </span>
                                            : null}
                                    </button>
                                } */}

                                {
                                    curr_url.pathname === "/checkout" ?
                                        null :
                                        city.city === null || cookies.get('jwt_token') === undefined
                                            ? <button type='button' whiletap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative'
                                                onClick={() => {
                                                    if (cookies.get('jwt_token') === undefined) {
                                                        toast.error(t("required_login_message_for_cartRedirect"));
                                                    }
                                                    else if (city.city === null) {
                                                        toast.error("Please Select you delivery location first!");
                                                    }
                                                }}>
                                                <IoCartOutline />
                                            </button>
                                            : <>
                                                <button type='button' className={isDesktopView ? "d-none" : "d-block"} onClick={openCanvasModal}>
                                                    <GoLocation size={25} style={{ backgroundColor: `var(--second-cards-color)` }} />
                                                </button>
                                                <button type='button' whileTap={{ scale: 0.6 }} className='icon mx-4 me-sm-5 position-relative' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample"
                                                    onClick={() => {
                                                        if (cookies.get('jwt_token') === undefined) {
                                                            toast.error(t("required_login_message_for_cartRedirect"));
                                                        }
                                                        else if (city.city === null) {
                                                            toast.error("Please Select you delivery location first!");
                                                        }
                                                    }}>
                                                    <IoCartOutline />
                                                    {cart.cart !== null ?
                                                        <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5">
                                                            {cart.cart.total}
                                                            <span className="visually-hidden">unread messages</span>
                                                        </span>
                                                        : null}
                                                </button>
                                            </>
                                }

                                {user.status === 'loading'
                                    ? (
                                        <div className='hide-mobile-screen px-3'>
                                            <div whiletap={{ scale: 0.6 }} className='d-flex flex-row user-profile gap-1' onClick={() => setShowModal(true)}>
                                                <div className='d-flex align-items-center user-info my-auto'>
                                                    <span className='btn-success'><IoPersonOutline className='user_icon' /></span>
                                                    <span className='pe-3'>{t("login")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    : (
                                        <div className='hide-mobile-screen ms-5'>
                                            <Link to='/profile' className='d-flex align-items-center flex-row user-profile gap-1' >
                                                <div className='d-flex flex-column user-info my-auto'>
                                                    <span className='number'> {t("welcome")}</span>
                                                    <span className='name'> {user.user && user.user.name.split(' ')[0]}</span>
                                                </div>
                                                <img onError={placeHolderImage} src={user.user && user.user.profile} alt="user"></img>
                                            </Link>
                                        </div>
                                    )}

                            </div>

                        </div>
                    </div>
                </div>


                {/* Mobile bottom Nav */}
                <nav className='header-mobile-nav'>
                    <div className='mobile-nav-wrapper'>
                        <ul>
                            <li className='menu-item'>
                                <Link to='/products' className={`shop ${curr_url.pathname === '/products' && mobileNavActKey == 1 ? 'active' : ''}`} onClick={() => {
                                    // document.getElementsByClassName('shop')[0].classList.add('active');
                                    // if (curr_url.pathname !== '/products') {
                                    //     if (curr_url.pathname === '/products') {
                                    //         document.getElementsByClassName('filter')[0].classList.remove('active');
                                    //     }
                                    //     if (curr_url.pathname === '/profile') {
                                    //         document.getElementsByClassName('profile-account')[0].classList.remove('active');
                                    //     }
                                    //     document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                    //     document.getElementsByClassName('search')[0].classList.remove('active');
                                    //     document.getElementsByClassName('header-search')[0].classList.remove('active');
                                    // }
                                    handleMobileNavActKey(1);
                                }}>
                                    <div>
                                        <BsShopWindow />
                                    </div>
                                    <span>{t("shop")}</span>
                                </Link>
                            </li>

                            <li className='menu-item'>
                                <button type='button' className={`search ${mobileNavActKey == 2 ? "active" : ""}`} ref={searchNavTrigger} onClick={() => {
                                    handleMobileNavActKey(2);
                                    searchNavTrigger.current.focus();
                                    // document.getElementsByClassName('header-search')[0].classList.toggle('active');
                                    // document.getElementsByClassName('search')[0].classList.toggle('active');
                                    // if (curr_url.pathname === '/products') {
                                    //     document.getElementsByClassName('filter')[0].classList.remove('active');
                                    // }
                                    // if (curr_url.pathname === '/profile') {
                                    //     document.getElementsByClassName('profile-account')[0].classList.remove('active');
                                    // }
                                    // document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                    // if (curr_url.pathname !== '/products') {
                                    //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                    // }
                                }}>
                                    <div>
                                        <MdSearch />
                                    </div>
                                    <span>{t("search")}</span>
                                </button>
                            </li>

                            {curr_url.pathname === '/products' ? (
                                <li className='menu-item'>
                                    <button type='button' className={`filter ${mobileNavActKey == 3 ? "active" : ""}`} data-bs-toggle="offcanvas" data-bs-target="#filteroffcanvasExample" aria-controls="filteroffcanvasExample" onClick={() => {
                                        // if (curr_url.pathname === '/profile') {
                                        //     document.getElementsByClassName('profile-account')[0].classList.remove('active');
                                        // }
                                        handleMobileNavActKey(3);
                                        // document.getElementsByClassName('filter')[0].classList.toggle('active');
                                        // document.getElementsByClassName('search')[0].classList.remove('active');
                                        // document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                        // if (curr_url.pathname !== '/products') {
                                        //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                        // }
                                        // document.getElementsByClassName('header-search')[0].classList.remove('active');
                                    }}>
                                        <div>
                                            <FiFilter />
                                        </div>
                                        <span>{t("filter")}</span>
                                    </button>
                                </li>
                            ) : ""}

                            <li className='menu-item'>
                                {city.city === null || cookies.get('jwt_token') === undefined
                                    ? <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (cookies.get('jwt_token') === undefined) {
                                            toast.error(t("required_login_message_for_wishlist"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
                                            handleMobileNavActKey(4);
                                            navigate("/wishlist");
                                            // document.getElementsByClassName('wishlist')[0].classList.toggle('active');
                                            // if (curr_url.pathname === '/products') {
                                            //     document.getElementsByClassName('filter')[0].classList.remove('active');
                                            // }
                                            // if (curr_url.pathname === '/profile') {
                                            //     document.getElementsByClassName('profile-account')[0].classList.remove('active');
                                            // }
                                            // if (curr_url.pathname !== '/products') {
                                            //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                            // }
                                            // document.getElementsByClassName('search')[0].classList.remove('active');
                                            // document.getElementsByClassName('header-search')[0].classList.remove('active');
                                        }


                                    }}>
                                        <div>
                                            <IoHeartOutline />

                                        </div>
                                        <span>{t("wishList")}</span>
                                    </button>
                                    : <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (cookies.get('jwt_token') === undefined) {
                                            toast.error(t("required_login_message_for_cartRedirect"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
                                            // document.getElementsByClassName('wishlist')[0].classList.toggle('active');
                                            // if (curr_url.pathname === '/products') {
                                            //     document.getElementsByClassName('filter')[0].classList.remove('active');
                                            // }
                                            // if (curr_url.pathname === '/profile') {
                                            //     document.getElementsByClassName('profile-account')[0].classList.remove('active');
                                            // }
                                            // if (curr_url.pathname !== '/products') {
                                            //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                            // }
                                            // document.getElementsByClassName('search')[0].classList.remove('active');
                                            // document.getElementsByClassName('header-search')[0].classList.remove('active');
                                            handleMobileNavActKey(4);
                                            navigate("/wishlist");
                                        }
                                    }
                                    }>
                                        {/*  data-bs-toggle="offcanvas" data-bs-target="#favoriteoffcanvasExample" aria-controls="favoriteoffcanvasExample" */}
                                        <div>
                                            <IoHeartOutline />

                                            {favorite.favorite && favorite.favorite.status !== 0 ?
                                                <span className="translate-middle badge rounded-pill fs-5" style={{ background: "var(--secondary-color)", borderRadius: "50%", color: "#fff", top: "1px", right: "-9px" }}>
                                                    {favorite.favorite && favorite.favorite.status !== 0 && favorite.favorite.total}
                                                    <span className="visually-hidden">unread messages</span>
                                                </span>
                                                : null}
                                        </div>
                                        <span>{t("wishList")}</span>
                                    </button>}

                            </li>

                            {curr_url.pathname === '/profile' ? (
                                <li className='menu-item'>
                                    <button type='button' className={`profile-account user-profile ${mobileNavActKey == 5 ? "active" : ""}`} onClick={() => {
                                        handleMobileNavActKey(5);
                                        document.getElementsByClassName('profile-account')[0].classList.toggle('active');
                                        document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                        if (curr_url.pathname === '/products') {
                                            document.getElementsByClassName('filter')[0].classList.remove('active');
                                        }
                                        if (curr_url.pathname !== '/products') {
                                            document.getElementsByClassName('shop')[0].classList.remove('active');
                                        }
                                        document.getElementsByClassName('search')[0].classList.remove('active');
                                        document.getElementsByClassName('header-search')[0].classList.remove('active');

                                    }} data-bs-toggle="offcanvas" data-bs-target="#profilenavoffcanvasExample" aria-controls="profilenavoffcanvasExample">
                                        {/* <div>
                                            <MdOutlineAccountCircle />

                                        </div> */}
                                        <div>
                                            <img src={user?.user?.profile} alt='profile_image' />
                                        </div>
                                        <span>{t("my_account")}</span>
                                    </button>
                                </li>
                            ) :
                                (
                                    <li className='menu-item'>
                                        {user.status === 'loading'
                                            ? (
                                                <>
                                                    <button type='button' className={`account ${mobileNavActKey == 5 ? "active" : ""}`} data-bs-toggle="modal" data-bs-target="#loginModal" onClick={() => {
                                                        handleMobileNavActKey(5);
                                                        // document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                                        // if (curr_url.pathname === '/products') {
                                                        //     document.getElementsByClassName('filter')[0].classList.remove('active');
                                                        // }
                                                        // if (curr_url.pathname !== '/products') {
                                                        //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                                        // }
                                                        // document.getElementsByClassName('search')[0].classList.remove('active');
                                                        // document.getElementsByClassName('header-search')[0].classList.remove('active');

                                                    }}>
                                                        <div>
                                                            <BiUserCircle />
                                                        </div>
                                                        <span>{t("login")}</span>

                                                    </button>

                                                </>
                                            )
                                            : (
                                                <>
                                                    <Link to='/profile' className={`d-flex user-profile account ${mobileNavActKey == 5 ? "active" : ""}`} onClick={() => {
                                                        handleMobileNavActKey(5);
                                                        // document.getElementsByClassName('wishlist')[0].classList.remove('active');
                                                        // if (curr_url.pathname === '/products') {
                                                        //     document.getElementsByClassName('filter')[0].classList.remove('active');
                                                        // }
                                                        // if (curr_url.pathname !== '/products') {
                                                        //     document.getElementsByClassName('shop')[0].classList.remove('active');
                                                        // }
                                                        // document.getElementsByClassName('search')[0].classList.remove('active');
                                                        // document.getElementsByClassName('header-search')[0].classList.remove('active');

                                                    }} >
                                                        <div className='d-flex flex-column user-info my-auto'>
                                                            <span className='name'> {user.user?.name}</span>
                                                        </div>
                                                        <img onError={placeHolderImage} src={user.user?.profile} alt="user"></img>
                                                        <span>{t("profile")}</span>
                                                    </Link>
                                                </>
                                            )}


                                    </li>
                                )}


                        </ul>
                    </div>
                </nav>




                {/* login modal */}

                <Login show={showModal} setShow={setShowModal} />

                {/* location modal */}
                <Modal
                    className='location'
                    id="locationModal"
                    centered
                    open={locModal}
                    transitionName=''
                >
                    <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent}
                        showModal={locModal} setLocModal={setLocModal} bodyScroll={setBodyScroll} />
                </Modal>



                {/* {
                    bodyScroll ?
                        <div className="modal fade location" id="locationModal" data-bs-backdrop="static" aria-labelledby="locationModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content" style={{ borderRadius: "10px" }}>
                                    <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent}
                                        showModal={showModal} setShowModal={setShowModal} bodyScroll={setBodyScroll} />
                                </div>
                            </div>
                        </div> : ''
                } */}


                {/* <div className="modal fade location" id="locationModal" data-bs-backdrop="static" aria-labelledby="locationModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: "10px" }}>
                            <Location isLocationPresent={isLocationPresent} setisLocationPresent={setisLocationPresent}
                                showModal={showModal} setShowModal={setShowModal} />
                        </div>
                    </div>
                </div> */}


                {/* Cart Sidebar */}
                <Cart />

                {/* favorite sidebar */}
                {/* <Favorite /> */}

            </header>

        </>
    );
};

export default Header;
