import React, { useEffect, useState } from 'react'
import "./productContainer.css"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/api';
import ProductCard from './ProductCard';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';


const ProductSwiperWithImage = ({ section, index }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const imageUrl = "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=600";
    const { cssmode } = useSelector(state => state.cssmode)
    const shop = useSelector((state) => state.shop);
    const [promotionImage, setPromotionImage] = useState(null)
    useEffect(() => {
        const promotionImageBelowSection = shop?.shop?.offers?.filter((offer) => offer?.position == "below_section");
        const image = promotionImageBelowSection?.filter((offer) => {
            return offer?.section?.title == section?.title
        })
        setPromotionImage(image)
    }, [section])


    return (
        <>
            {section?.products?.length > 0 ?
                <section className='product-container-with-image' style={cssmode == "dark" ?
                    section?.background_color_for_dark_theme != "" ? { backgroundColor: section?.background_color_for_dark_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                    :
                    section?.background_color_for_light_theme != "" ?
                        { backgroundColor: section?.background_color_for_light_theme } :
                        { backgroundColor: "var(--body-background-color)" }
                }>
                    <div className='container'>
                        <div>
                            <div className='product-container-header'>
                                <div>
                                    <h2>{section?.title}</h2>
                                    <p>{section?.short_description}</p>
                                </div>
                                {section?.products?.length > 3 ? <div className='d-flex align-items-center'>
                                    <Link to='/products'>View all</Link>
                                    <div>
                                        <button className={` prev-arrow-category prev-btn-${index}`}><IoMdArrowBack fill='black' size={20} /></button>
                                        <button className={` next-arrow-category next-btn-${index}`}><IoMdArrowForward fill='black' size={20} /></button>
                                    </div>
                                </div> : null}

                            </div>

                            <div className="row product-image-container-swiper">

                                <div className='col-lg-3  col-12 overflow-hidden'>
                                    <img src={section?.banner_web_url} className='swiper-cover-img' />
                                </div>


                                <div className='col-lg-9 col-md-12 col-12'>
                                    <Swiper
                                        modules={[Navigation, Pagination]}
                                        navigation={{
                                            prevEl: `.prev-btn-${index}`,
                                            nextEl: `.next-btn-${index}`,
                                        }}
                                        spaceBetween={10}
                                        pagination={{ clickable: true }}
                                        breakpoints={{
                                            1200: {
                                                slidesPerView: 3,
                                            },
                                            1024: {
                                                slidesPerView: 3,
                                            },
                                            768: {
                                                slidesPerView: 2.5,
                                            },
                                            425: {
                                                slidesPerView: 2,
                                            },
                                            300: {
                                                slidesPerView: 1.6,
                                            },
                                        }}>
                                        {section?.products && section?.products?.map((prdct) => {
                                            return (
                                                <SwiperSlide key={prdct.id}>
                                                    <ProductCard product={prdct} />
                                                </SwiperSlide>
                                            )
                                        })}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >
                : null}
            {
                promotionImage?.map((offer) => (
                    <div className='col-md-12  col-12 container promotion-img' key={offer?.id} onClick={() => {
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
                ))
            }

        </>
    )
}

export default ProductSwiperWithImage;