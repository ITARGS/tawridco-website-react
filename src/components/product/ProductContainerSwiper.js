import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as newApi from "../../api/apiCollection"
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './product.css';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { setProductSizes } from "../../model/reducer/productSizesReducer";
import { clearAllFilter, setFilterCategory, setFilterSection } from '../../model/reducer/productFilterReducer';
import Loader from '../loader/Loader';
import 'react-loading-skeleton/dist/skeleton.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';


const ProductContainer = React.memo(({ BelowSectionOfferArray }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const city = useSelector(state => state.city);
    const shop = useSelector(state => state.shop);
    const sizes = useSelector(state => state.productSizes);
    const [productSizes, setproductSizes] = useState(null);
    const [offerConatiner, setOfferContainer] = useState(0);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (sizes.sizes === null || sizes.status === 'loading') {
                    if (city.city !== null) {
                        const result = await newApi.productByFilter({ latitude: city.city.latitude, longitude: city.city.longitude })
                        if (result.status === 1) {
                            setproductSizes(result.sizes);
                            dispatch(setProductSizes({ data: result.sizes }));
                        }
                    }
                }
                else {
                    setproductSizes(sizes.sizes);
                }
            } catch (error) {
                console.log("Error", error)
            }

        }
        fetchProducts();
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
                                                    <div >
                                                        <div className="product-title-content-container">
                                                            <p>{section.title}</p>
                                                            <span className='d-none d-md-block'>{section.short_description}</span>
                                                        </div>
                                                    </div>
                                                    <div className='d-flex align-items-center flex-md-row flex-column'>
                                                        <div>
                                                            <Link className="d-flex" to="/products" onClick={() => {
                                                                dispatch(clearAllFilter());
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

                                                    <Swiper
                                                        modules={[Navigation, Pagination]}
                                                        navigation={{
                                                            prevEl: `.prev-arrow-country.section-${index0}`,
                                                            nextEl: `.next-arrow-country.section-${index0}`,
                                                        }}

                                                        pagination={{ clickable: true }}
                                                        breakpoints={{
                                                            1200: {
                                                                slidesPerView: 5,
                                                                spaceBetween: 10
                                                            },
                                                            1024: {
                                                                slidesPerView: 4.5,
                                                                spaceBetween: 10
                                                            },
                                                            768: {
                                                                slidesPerView: 3.5,
                                                                spaceBetween: 10
                                                            },
                                                            500: {
                                                                slidesPerView: 2,
                                                                spaceBetween: 10
                                                            },
                                                            300: {
                                                                slidesPerView: 1.5,
                                                                spaceBetween: 10
                                                            },
                                                        }}>
                                                        {section?.products?.map((product, index) => (
                                                            <SwiperSlide key={index}>

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