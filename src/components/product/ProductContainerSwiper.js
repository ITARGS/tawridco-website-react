import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './product.css';
import { AiOutlineEye } from 'react-icons/ai';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsHeart, BsShare, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import QuickViewModal from './QuickViewModal';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import { IoIosArrowDown, IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import { useTranslation } from 'react-i18next';

import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setSellerFlag } from "../../model/reducer/cartReducer";
import { setFavouriteLength, setFavouriteProductIds } from "../../model/reducer/favouriteReducer";
import { setProductSizes } from "../../model/reducer/productSizesReducer";
import { setFilterCategory, setFilterSection } from '../../model/reducer/productFilterReducer';
import Popup from "../same-seller-popup/Popup";
import { LuStar } from 'react-icons/lu';
import Loader from '../loader/Loader';
import { setSelectedProduct } from '../../model/reducer/selectedProduct';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';


const ProductContainer = React.memo(({ showModal, setShowModal, BelowSectionOfferArray }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const city = useSelector(state => state.city);
    const shop = useSelector(state => state.shop);
    const setting = useSelector(state => state.setting);
    const cart = useSelector(state => state.cart);
    const sizes = useSelector(state => state.productSizes);
    const favorite = useSelector(state => (state.favourite));
    const user = useSelector(state => (state.user));

    const [selectedVariant, setSelectedVariant] = useState({});
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);
    const [loader, setisLoader] = useState(false);
    const [selectedProduct, setselectedProduct] = useState({});
    const [productSizes, setproductSizes] = useState(null);
    const [offerConatiner, setOfferContainer] = useState(0);
    const [variant_index, setVariantIndex] = useState(null);

    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null) {
                api.getProductbyFilter(city.city.latitude, city.city.longitude)
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            setproductSizes(result.sizes);
                            dispatch(setProductSizes({ data: result.sizes }));
                        }
                    });
            }
        }
        else {
            setproductSizes(sizes.sizes);
        }
    }, [city, sizes]);
    return (
        <section id="products">
            <div className="container">
                {shop.shop === null || productSizes === null
                    ? (
                        <>
                            <div className="d-flex justify-content-center">
                                <Loader width={"100%"} height={"500px"} />
                            </div>
                        </>
                    )
                    : (
                        <>

                            {shop?.shop?.sections?.map((section, index0) => {
                                if (section.products.length > 0) {
                                    return (

                                        <div key={index0}>

                                            <div className='product_section row flex-column' value={index0} onChange={(e) => { setOfferContainer(index0); }}>

                                                <div className="d-flex product_title_content justify-content-between align-items-center col-md-12">
                                                    <div>
                                                        <div className="product-title-content-container">
                                                            <p>{section.title}</p>
                                                            <span className='d-none d-md-block'>{section.short_description}</span>
                                                        </div>

                                                    </div>
                                                    <div className='d-flex align-items-center flex-md-row flex-column'>
                                                        <div>
                                                            <Link className="d-flex" to="/products" onClick={() => {
                                                                dispatch(setFilterSection({ data: section.id }));
                                                                navigate('/products');
                                                            }}>{t('see_all')}</Link>
                                                        </div>
                                                        <div className='d-flex'>
                                                            <button className={`prev-arrow-category prev-arrow-country section-${index0}`}><IoMdArrowBack fill='black' size={20} /></button>
                                                            <button className={`next-arrow-category next-arrow-country section-${index0}`}><IoMdArrowForward fill='black' size={20} /></button>
                                                        </div>
                                                    </div>

                                                </div>

                                                <div className="product_section_content ">
                                                    {/* {section?.products?.length > 4 ? <div>
                                                        <button type="button" className={`slick-prev prev-arrow-country section-${index0}`} >
                                                            <FaChevronLeft fill='black' size={30} className="prev-arrow " />
                                                        </button>
                                                        <button type="button" className={`slick-next next-arrow-country section-${index0}`}>
                                                            <FaChevronRight fill='black' size={30} className='next-arrow' />
                                                        </button>

                                                    </div> : <></>} */}


                                                    <Swiper
                                                        modules={[Navigation, Pagination]}
                                                        navigation={{
                                                            prevEl: `.prev-arrow-country.section-${index0}`,
                                                            nextEl: `.next-arrow-country.section-${index0}`,
                                                        }}
                                                        spaceBetween={10}
                                                        pagination={{ clickable: true }}
                                                        breakpoints={{
                                                            1200: {
                                                                slidesPerView: 4,
                                                            },
                                                            1024: {
                                                                slidesPerView: 4,
                                                            },
                                                            768: {
                                                                slidesPerView: 3.5,
                                                            },
                                                            300: {
                                                                slidesPerView: 1.5,
                                                            },
                                                        }}>
                                                        {section?.products?.map((product, index) => (
                                                            <SwiperSlide className="row" key={index}>

                                                                <ProductCard product={product} />

                                                            </SwiperSlide>
                                                        ))}
                                                    </Swiper>
                                                </div>


                                            </div>
                                            {BelowSectionOfferArray?.filter((offer) => offer?.section?.title == section?.title)?.map((offer) => (
                                                <div className='col-md-12 p-0 col-12 my-5' key={offer?.id} onClick={() => {
                                                    if (offer?.category) {
                                                        dispatch(setFilterCategory({ data: offer?.category?.id.toString() }));
                                                        navigate("/products");
                                                    } else if (offer?.product) {
                                                        navigate(`/product/${offer.product.slug}`);
                                                    } else if (offer?.offer_url) {
                                                        window.open(offer?.offer_url, "_blank");
                                                    }
                                                }}>
                                                    <img className={`offerImages ${offer?.category ? "cursorPointer" : ""} ${offer?.product ? "cursorPointer" : ""} ${offer?.offer_url ? "cursorPointer" : ""}`} src={offer.image_url} alt="offers" />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                            })}

                        </>


                    )
                }
            </div>
        </section>
    );
});

export default ProductContainer;