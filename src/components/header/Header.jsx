import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import * as newApi from '../../api/apiCollection';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { Modal } from 'antd';
import "../location/location.css";

// reducres import
import { setCity } from "../../model/reducer/locationReducer";
import { setPaymentSetting } from '../../model/reducer/settingReducer';
import { setLanguage, setLanguageList } from "../../model/reducer/languageReducer";
import { setFilterSearch } from "../../model/reducer/productFilterReducer";
import { setCSSMode } from '../../model/reducer/cssmodeReducer';
import { setCart, setCartProducts, setCartSubTotal, setTotalCartValue } from '../../model/reducer/cartReducer';

// icons import
import { BsMoon, BsShopWindow } from 'react-icons/bs';
import { BiUserCircle } from 'react-icons/bi';
import { MdSearch, MdGTranslate, MdNotificationsActive, MdOutlineWbSunny, MdOutlinePhoneInTalk } from "react-icons/md";
import { IoNotificationsOutline, IoHeartOutline, IoCartOutline, IoPersonOutline, IoContrast, IoCloseCircle, IoLocationOutline } from 'react-icons/io5';
import { IoMdArrowDropdown, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GoLocation } from 'react-icons/go';
import { FiMenu, FiFilter, FiUser } from 'react-icons/fi';
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai';
import { FaFacebookSquare, FaInstagramSquare, FaTwitterSquare, FaLinkedin, FaSearch, FaPhoneVolume } from "react-icons/fa";

// components imports
import Location from '../location/Location';
import Login from '../login/Login';
import Cart from '../cart/Cart';




const Header = () => {
    const closeSidebarRef = useRef();
    const searchNavTrigger = useRef();
    const { t } = useTranslation();
    const curr_url = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const city = useSelector(state => (state.city));
    const cssmode = useSelector(state => (state.cssmode));
    const user = useSelector(state => (state.user));
    const cart = useSelector(state => (state.cart));
    const favorite = useSelector(state => (state.favourite));
    const setting = useSelector(state => (state.setting));
    const languages = useSelector((state) => (state.language));
    const [isSticky, setIsSticky] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bodyScroll, setBodyScroll] = useState(false);
    const [locModal, setLocModal] = useState(false);
    const [mobileNavActKey, setMobileNavActKey] = useState(null);
    const [isLocationPresent, setisLocationPresent] = useState(false);
    const [totalNotification, settotalNotification] = useState(null);
    const [isDesktopView, setIsDesktopView] = useState(window.innerWidth > 768);
    const [search, setsearch] = useState("");
    const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("")

    const openCanvasModal = () => {
        handleModal();
        closeSidebarRef.current.click();
    };

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const result = await newApi.getCart({ latitude: city?.city?.latitude, longitude: city?.city?.longitude })
                if (result.status == 1) {

                    const productsData = result?.data?.cart?.map((product) => {
                        return {
                            product_id: product?.product_id,
                            product_variant_id: product?.product_variant_id,
                            qty: product?.qty
                        };
                    });
                    dispatch(setCartSubTotal({ data: result?.data?.sub_total }))
                    dispatch(setCartProducts({ data: productsData }));
                } else if (result.message == "No item(s) found in users cart") {
                    dispatch(setCartProducts({ data: [] }));
                }
            } catch (err) {
                console.log(err?.message);
            }
        };
        fetchCartData()
    }, [])

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
        if (curr_url.pathname != "/products") {
            setsearch("");
            dispatch(setFilterSearch({ data: null }));
        }
    }, [curr_url]);

    useEffect(() => {
        const fetchCity = async () => {
            try {
                if (setting.setting?.default_city && city.city == null) {
                    setisLocationPresent(true);
                    const latitude = parseFloat(setting.setting.default_city?.latitude)
                    const longitude = parseFloat(setting.setting.default_city?.longitude)
                    const response = await newApi.getCity({ latitude: latitude, longitude: longitude })
                    if (response.status === 1) {
                        dispatch(setCity({ data: response.data }));
                    } else {
                        setLocModal(true);
                    }
                    dispatch(setCity({ data: response.data }));
                }
                else if (setting?.setting && setting.setting?.default_city == null && city?.city == null) {
                    setLocModal(true);
                }
            } catch (error) {
                console.log("error", error)
            }
        }
        fetchCity()
    }, [setting]);


    useEffect(() => {
        // if (languages?.available_languages === null) {
        api.getSystemLanguage(0, 0)
            .then((response) => response.json())
            .then((result) => {
                dispatch(setLanguageList({ data: result.data }));
            });
        // }
        if ((curr_url?.pathname == "/") || (curr_url?.pathname == "/profile/wallet-transaction") || (curr_url?.pathname == "/checkout")) {
            fetchPaymentSetting();
        }
        // dispatch(setFilterSearch({ data: null }));
        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when the component unmounts
        const handleClickOutside = (event) => {
            if (closeSidebarRef.current && !closeSidebarRef.current.contains(event.target) && !event.target.closest(".lang-mode-utils")) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchPaymentSetting = async () => {
        await api.getPaymentSettings(user?.jwtToken)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setPaymentSetting({ data: JSON.parse(atob(result.data)) }));
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
                    dispatch(setLanguage({ data: result.data }));
                }
            });
    };

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const handleResize = () => {
        setIsDesktopView(window.innerWidth > 768);
    };

    // console.log(isDesktopView)
    const handleMobileNavActKey = (key) => {
        setMobileNavActKey(key == mobileNavActKey ? null : key);
    };

    const handleThemeChange = (theme) => {
        document.body.setAttribute("data-bs-theme", theme);
        dispatch(setCSSMode({ data: theme }));
    };



    return (
        <>
            {/* sidebar */}
            <div className="hide-desktop offcanvas offcanvas-start" tabIndex="-1" id="sidebaroffcanvasExample" aria-labelledby="sidebaroffcanvasExampleLabel">
                <div className='site-scroll ps'>

                    <div className="canvas-header">
                        <div className='site-brand'>
                            <img src={setting.setting && setting.setting.web_settings.web_logo} className='off-canvas-logo' alt="logo"></img>
                        </div>
                        <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeSidebarRef} onClick={() => setIsOpen(false)}><IoCloseCircle fill='white' size={100} /></button>
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
                                {/* <li className='dropdown-item menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children'>
                                    <button type='button' onClick={() => {
                                        if (user.user) {
                                            closeSidebarRef.current.click();
                                            navigate('/notification');
                                        } else {
                                            closeSidebarRef.current.click();
                                            toast.error(t('required_login_message_for_notification'));
                                        }
                                    }}>{t("notification")}</button>
                                </li> */}

                            </ul>
                            {/* {setting.setting.social_media.length > 0 ? <div>

                                <div className='follow-us-container'>
                                    <p>{t('follow_us')}</p>
                                    <div className='follow-icons-container'>
                                        {setting.setting.social_media.slice(0, Math.min(4, setting.setting.social_media.length)).map((icon, index) => {
                                            return (
                                                <a key={index} href={icon.link} className='socical-icons'>
                                                    <i className={` fab ${icon.icon} fa-lg header-icons`} >
                                                    </i>
                                                </a>
                                            );
                                        })}


                                    </div>
                                </div>
                            </div> : null} */}


                            <div className='lang-mode-utils'>
                                <div className='language-container' >
                                    <MdGTranslate size={24} />
                                    <Dropdown >
                                        <Dropdown.Toggle variant='Secondary' >
                                            {languages.current_language && languages.current_language.name}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {languages.available_languages && languages.available_languages.map((language, index) => {
                                                return (
                                                    <Dropdown.Item key={index} onClick={() => {
                                                        handleChangeLanguage(language.id);
                                                    }}>{language.name}</Dropdown.Item>
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
            <header className='site-header  desktop-shadow-disable mobile-shadow-enable bg-white  mobile-nav-enable border-bottom' >


                {/* top header */}
                <div className={`header-top  hide-mobile border-bottom ${(cssmode.cssmode === "dark") ? "dark-header-top" : ''}`}>
                    <div className="container">
                        <div className={`row justify-content-between`}>
                            <div className='col-md-6 d-flex justify-content-start align-items-center social-icons-cotainer'>
                                <span>{t("follow_us")}</span>
                                <FaFacebookSquare className='social-icons border-end' size={30} />
                                <FaInstagramSquare className='social-icons border-end' size={30} />
                                <FaTwitterSquare className='social-icons border-end' size={30} />
                                <FaLinkedin className='social-icons ' size={30} />
                                {/* <Link to='/about' className={`borderPad  border-end ${(cssmode.cssmode === "dark") ? "dark-header-1" : ''}`} > {t('about_us')}</Link>
                                <Link to='/contact' className={`borderPad border-end `} > {t('contact_us')}</Link>
                                <Link to='/faq' className={`borderPad border-end `} >{t('faq')}</Link> */}
                            </div>
                            <div className='col-md-6 d-flex justify-content-end'>

                                <div className='d-flex align-items-center px-2 '>
                                    <Dropdown className='themeDropdown'>
                                        <Dropdown.Toggle>
                                            <IoContrast size={20} className='me-2' />
                                            {t(cssmode.cssmode)}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {cssmode?.cssmode === "dark" ? <Dropdown.Item key={"dark"} onClick={() => handleThemeChange("light")}>Light</Dropdown.Item> : null}
                                            {cssmode?.cssmode === "light" ? <Dropdown.Item key={"light"} onClick={() => handleThemeChange("dark")}>Dark</Dropdown.Item> : null}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                <div className='language-container' >
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


                {/* center header */}
                <div className={isSticky ? "sticky header-main  w-100" : "header-main  w-100"} >
                    <div className="container">
                        <div className='d-flex row-reverse justify-content-lg-between justify-content-center'>

                            <div className='d-flex w-auto align-items-center justify-content-start col-md-2  column-left '>

                                <div className='header-buttons hide-desktop' >

                                    <button className='header-canvas button-item' type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebaroffcanvasExample" aria-controls="sidebaroffcanvasExample">
                                        <div className='button-menu'>
                                            <FiMenu />
                                        </div>
                                    </button>
                                </div>


                                <Link to='/' className='site-brand'>
                                    <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='desktop-logo hide-mobile' />
                                    {/* <img src={setting.setting && setting.setting.web_settings.web_logo} alt="logo" className='mobile-logo hide-desktop' /> */}
                                </Link>



                            </div>


                            <div className='header-nav-list'>
                                <ul>
                                    <li
                                        className={curr_url.pathname == "/" ? "active-link" : ""}
                                        onClick={() => navigate('/')}
                                    > <a>Home</a></li>
                                    <li
                                        className={curr_url.pathname == "/about" ? "active-link" : ""}
                                        onClick={() => navigate('/about')}
                                    ><a>About us</a></li>
                                    <li
                                        className={curr_url.pathname == "/faq" ? "active-link" : ""}
                                        onClick={() => navigate('/faq')}
                                    ><a>FAQ's</a></li>
                                    <li
                                        className={curr_url.pathname == "/contact" ? "active-link" : ""}
                                        onClick={() => navigate('/contact')}
                                    > <a>Contanct Us</a></li>
                                </ul>
                            </div>

                            <div className='header-btn-containers'>
                                {/* {user?.jwtToken == "" ? :} */}
                                <div className='me-5' onClick={() => setIsCartSidebarOpen(true)} role='button' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample">
                                    <span className='cart-btn' >
                                        <IoCartOutline size={24} />
                                        {
                                            cart.isGuest == true ? <p className={cart?.guestCart
                                                ?.length != 0 ? "d-flex" : "d-none"}> {cart?.guestCart
                                                    ?.length != 0 ? cart?.guestCart
                                                    ?.length : null}</p> :
                                                <p className={cart?.cartProducts?.length != 0 ? "d-flex" : "d-none"}> {cart?.cartProducts?.length != 0 ? cart?.cartProducts?.length : null}</p>
                                        }

                                    </span>
                                    <span className='cart-value'>
                                        <span>Your Cart</span>
                                        <h4>{setting.setting && setting.setting.currency}{
                                            cart.isGuest == true ? cart?.guestCartTotal && cart?.guestCartTotal.toFixed(2) :
                                                cart?.cartSubTotal && cart?.cartSubTotal.toFixed(2)}</h4>
                                    </span>
                                </div>
                                {user?.jwtToken == "" ? <div role='button' onClick={() => setShowModal(true)}>
                                    <span className='cart-btn'>
                                        <FiUser size={24} />

                                    </span>
                                    <div className=''>
                                        <h4>{t("login")}</h4>
                                    </div>
                                </div> : <div >

                                    <span className='cart-btn'>
                                        <FiUser size={24} />

                                    </span>
                                    <div className='profile-section'>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Profile
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>Profile </Dropdown.Item>
                                                <Dropdown.Item>Address</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>}


                            </div>
                            {/* <div className='d-flex  w-lg-100 col-md-6 order-2 justify-content-center align-items-center '>
                                <button whiletap={{ scale: 0.6 }} type='buton' className='header-location site-location hide-mobile' onClick={handleModal}>
                                    <div className='d-flex flex-row gap-2'>
                                        <div className='icon location p-1 m-auto'>
                                            <GoLocation fill='black' />
                                        </div>

                                        <div className='d-flex flex-column flex-grow-1 align-items-start ' >
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
                                        {search != "" ? <AiOutlineClose size={15} className='cursorPointer' style={{
                                            position: "absolute",
                                            right: "65px"
                                        }} onClick={() => {
                                            setsearch("");
                                            dispatch(setFilterSearch({ data: null }));
                                        }} /> : null}
                                        <button type='submit'>
                                            <MdSearch fill='white' />
                                        </button>
                                    </form>
                                </div>


                            </div> */}


                            {/* <div className='d-flex col-md-3 w-auto order-3  justify-content-end align-items-center'>
                                <button type='button' whiletap={{ scale: 0.6 }} className='icon position-relative hide-mobile mx-sm-4' onClick={() => {
                                    if (user?.jwtToken === "") {
                                        toast.error(t("required_login_message_for_notification"));
                                    }
                                    else {
                                        navigate('/notification');
                                    }
                                }}>
                                    {totalNotification === null ? <IoNotificationsOutline />
                                        : <MdNotificationsActive fill="var(--secondary-color)" />}

                                </button>

                                {city.city === null || user?.jwtToken === ""
                                    ? <button whiletap={{ scale: 0.6 }} className='icon mx-sm-4 position-relative hide-mobile-screen'
                                        onClick={() => {
                                            if (user?.jwtToken === "") {
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
                                            if (user?.jwtToken === "") {
                                                toast.error(t("required_login_message_for_cartRedirect"));
                                            }
                                            else if (city.city === null) {
                                                toast.error("Please Select you delivery location first!");
                                            } else {
                                                navigate("/wishlist");
                                            }
                                        }}>
                                        <IoHeartOutline className='' />
                                        {(favorite.favouritelength !== 0) ?
                                            <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5 ">
                                                {favorite.favouritelength}
                                                <span className="visually-hidden">unread messages</span>
                                            </span>
                                            : null}

                                    </button>
                                }



                                {
                                    curr_url.pathname === "/checkout" ?
                                        null :
                                        city.city === null || user?.jwtToken === ""
                                            ?
                                            <>
                                                <button type='button' className={isDesktopView ? "d-none" : "d-block mt-2"} onClick={openCanvasModal}>
                                                    <GoLocation size={25} style={{ backgroundColor: `var(--second-cards-color)` }} />
                                                </button>
                                                <button type='button' whiletap={{ scale: 0.6 }} className='icon mx-4  position-relative'
                                                    data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample"
                                                    onClick={() => {
                                                        if (cart?.isGuest) {
                                                            setIsCartSidebarOpen(true);
                                                        }

                                                        else if (city.city === null) {
                                                            toast.error("Please Select you delivery location first!");
                                                        }
                                                    }}>
                                                    <IoCartOutline />
                                                    {cart?.isGuest === true && cart?.guestCart?.length !== 0 ?
                                                        <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5">
                                                            {cart?.guestCart?.length !== 0 ? cart?.guestCart?.length : null}
                                                            <span className="visually-hidden">unread messages</span>
                                                        </span>
                                                        : null}
                                                </button>
                                                {cssmode?.cssmode === "light" ?
                                                    <button className='themeBtn' onClick={() => handleThemeChange("dark")}><BsMoon size={25} className={isDesktopView ? "d-none " : "d-block mt-2 "} /></button>
                                                    :
                                                    <button className='themeBtn' onClick={() => handleThemeChange("light")}><MdOutlineWbSunny size={25} className={isDesktopView ? "d-none " : "d-block mt-2 "} /></button>}
                                            </>
                                            : <>
                                                <button type='button' className={isDesktopView ? "d-none" : "d-block mt-2"} onClick={openCanvasModal}>
                                                    <GoLocation size={25} style={{ backgroundColor: `var(--second-cards-color)` }} />
                                                </button>
                                                <button type='button' whiletap={{ scale: 0.6 }} className='icon mx-4  position-relative' data-bs-toggle="offcanvas" data-bs-target="#cartoffcanvasExample" aria-controls="cartoffcanvasExample"
                                                    onClick={() => {


                                                        if (cart?.isGuest) {
                                                            setIsCartSidebarOpen(true);
                                                        }
                                                        else if (city.city === null) {
                                                            toast.error("Please Select you delivery location first!");
                                                        } else {
                                                            setIsCartSidebarOpen(true);
                                                        }
                                                    }}>
                                                    <IoCartOutline />

                                                    {cart?.cartProducts?.length !== 0 ?
                                                        <span className="position-absolute start-100 translate-middle badge rounded-pill fs-5">
                                                            {cart?.cartProducts?.length != 0 ? cart?.cartProducts?.length : null}

                                                            <span className="visually-hidden">unread messages</span>
                                                        </span>
                                                        : null}

                                                </button>
                                                {cssmode?.cssmode === "light" ?
                                                    <button className='themeBtn' onClick={() => handleThemeChange("dark")}><BsMoon size={25} className={isDesktopView ? "d-none " : "d-block mt-2 "} /></button>
                                                    :
                                                    <button className='themeBtn' onClick={() => handleThemeChange("light")}><MdOutlineWbSunny size={25} className={isDesktopView ? "d-none " : "d-block mt-2 "} /></button>}

                                            </>
                                }

                                {user.status === 'loading'
                                    ? (
                                        <>
                                            {cssmode?.cssmode === "light" ?
                                                <button className='themeBtn tabletScreen icon position-relative hide-mobile-screen mx-3' onClick={() => handleThemeChange("dark")}><BsMoon size={25} /></button>
                                                :
                                                <button className='themeBtn tabletScreen icon position-relative hide-mobile-screen mx-3' onClick={() => handleThemeChange("light")}><MdOutlineWbSunny size={25} /></button>}
                                            <div className='hide-mobile-screen px-3'>
                                                <div whiletap={{ scale: 0.6 }} className='d-flex flex-row user-profile gap-1' onClick={() => setShowModal(true)}>
                                                    <div className='d-flex align-items-center user-info my-auto'>
                                                        <span className='btn-success'><IoPersonOutline className='user_icon' /></span>
                                                        <span className='pe-3'>{t("login")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                    : (
                                        <>
                                            {cssmode?.cssmode === "light" ?
                                                <button className='themeBtn tabletScreen icon position-relative hide-mobile-screen mx-3' onClick={() => handleThemeChange("dark")}><BsMoon size={25} /></button>
                                                :
                                                <button className='themeBtn tabletScreen icon position-relative hide-mobile-screen mx-3' onClick={() => handleThemeChange("light")}><MdOutlineWbSunny size={25} /></button>}
                                            <div className='hide-mobile-screen ms-5'>
                                                <Link to='/profile' className='d-flex align-items-center flex-row user-profile gap-1' >
                                                    <div className='d-flex flex-column user-info my-auto'>
                                                        <span className='number'> {t("welcome")}</span>
                                                        <span className='name'>
                                                            {user.user && user.user.name.split(' ')[0].length > 20
                                                                ? user.user.name.split(' ')[0].substring(0, 20) + "..."
                                                                : user.user.name.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <img onError={placeHolderImage} src={user.user && user.user.profile} alt="user"></img>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                            </div> */}

                        </div >
                        {/* Bottom header */}
                        <div className='d-flex row-reverse justify-content-lg-between justify-content-center bottom-header'>

                            <div className='d-flex w-auto align-items-center justify-content-start col-md-2  column-left location'
                                onClick={() => setLocModal(true)}
                                role='button'
                            >
                                <span className='location-btn'>
                                    <IoLocationOutline size={24} />
                                </span>
                                <span className='location-value'>
                                    <span>{t("deliver_to")}</span>
                                    <h4>{city.status === 'fulfill'
                                        ? city.city.formatted_address
                                        : (
                                            t("select_location")
                                        )}</h4>
                                </span>
                            </div>
                            <div className='d-flex w-auto align-items-center justify-content-start col-md-2  column-left search'>

                                <Dropdown>
                                    <Dropdown.Toggle>
                                        All categories
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item>Fruits</Dropdown.Item>
                                        <Dropdown.Item>Vegetables</Dropdown.Item>
                                        <Dropdown.Item>Dairy</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <input type='text' placeholder='I am looking for...' />
                                <button className='search-btn'><FaSearch size={20} />Search</button>
                            </div>
                            <div className='contact'>
                                <button >
                                    <MdOutlinePhoneInTalk size={25} />
                                    +91 9876543210
                                </button>
                            </div>
                        </div>
                    </div >
                </div >



                {/* Mobile bottom Nav */}
                <nav className='header-mobile-nav' >
                    <div className='mobile-nav-wrapper'>
                        <ul>
                            <li className='menu-item'>
                                <Link to='/products' className={`shop ${curr_url.pathname === '/products' && mobileNavActKey == 1 ? 'active' : ''}`} onClick={() => {
                                    handleMobileNavActKey(1);
                                }}>
                                    <div>
                                        <BsShopWindow fill='black' />
                                    </div>
                                    <span>{t("shop")}</span>
                                </Link>
                            </li>

                            <li className='menu-item'>
                                <button type='button' className={`search ${mobileNavActKey == 2 ? "active" : ""}`} ref={searchNavTrigger} onClick={() => {
                                    handleMobileNavActKey(2);
                                    searchNavTrigger.current.focus();
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
                                        handleMobileNavActKey(3);
                                    }}>
                                        <div>
                                            <FiFilter />
                                        </div>
                                        <span>{t("filter")}</span>
                                    </button>
                                </li>
                            ) : ""}

                            <li className='menu-item'>
                                {city.city === null || user?.jwtToken === ""
                                    ? <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (user?.jwtToken === "") {
                                            toast.error(t("required_login_message_for_wishlist"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
                                            handleMobileNavActKey(4);
                                            navigate("/wishlist");
                                        }


                                    }}>
                                        <div>
                                            <IoHeartOutline />

                                        </div>
                                        <span>{t("wishList")}</span>
                                    </button>
                                    : <button type='button' className={`wishlist ${mobileNavActKey == 4 ? "active" : ""}`} onClick={() => {

                                        if (user?.jwtToken === "") {
                                            toast.error(t("required_login_message_for_cartRedirect"));
                                        }
                                        else if (city.city === null) {
                                            toast.error("Please Select you delivery location first!");
                                        }
                                        else {
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
                                    <button type='button' className={`profile-account user-profile ${curr_url?.pathname.includes("/profile") ? "active" : ""}`} onClick={() => {
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
                                                    <button type='button' className={`account ${mobileNavActKey == 5 ? "active" : ""}`}
                                                        // data-bs-toggle="modal" data-bs-target="#loginModal"
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            handleMobileNavActKey(5);

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
                                                    <button className={`d-flex user-profile account ${mobileNavActKey == 5 ? "active" : ""}`} onClick={() => {
                                                        handleMobileNavActKey(5);
                                                        navigate("/profile");
                                                    }}>
                                                        <div className='d-flex flex-column user-info my-auto'>
                                                            <span className='name'> {user.user?.name}</span>
                                                        </div>
                                                        <img onError={placeHolderImage} src={user.user?.profile} alt="user"></img>
                                                        <span>{t("profile")}</span>
                                                    </button>
                                                </>
                                            )}


                                    </li>
                                )}


                        </ul>
                    </div>
                </nav >
                {/* login modal */}
                < Login show={showModal} setShow={setShowModal} />
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
                </Modal >





                {/* Cart Sidebar */}
                < Cart isCartSidebarOpen={isCartSidebarOpen} setIsCartSidebarOpen={setIsCartSidebarOpen} />

            </header >

        </>
    );
};

export default Header;
