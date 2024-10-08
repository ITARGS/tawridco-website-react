import React, { useEffect, useState } from 'react'
import "./productContainer.css"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useSelector } from 'react-redux';
import api from '../../api/api';
import ProductCard from './ProductCard';
import { IoMdArrowBack, IoMdArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';


const ProductSwiperWithImage = ({ section, index }) => {
    const imageUrl = "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=600";
    const { cssmode } = useSelector(state => state.cssmode)
    const city = useSelector(state => state.city);
    const setting = useSelector(state => state.setting)
    const [product, setProducts] = useState([])
    useEffect(() => {
        const latitude = city?.city?.latitude || setting?.setting?.default_city?.latitude
        const longitude = city?.city?.longitude || setting?.setting?.default_city?.longitude
        const fetchData = async () => {
            try {
                const res = await api.getProductbyFilter(latitude, longitude)
                const { data } = await res.json();
                setProducts(data);
            } catch (error) {
                console.log(error)
            }


        }
        fetchData();
    }, [])
    return (
        <>
            {section?.products?.length > 0 ?
                <section className='product-container-with-image' style={cssmode == "dark" ? {
                    backgroundColor: section?.background_color_for_dark_theme
                } : {
                    backgroundColor: section?.background_color_for_light_theme
                }}>
                    <div className='container'>
                        <div>
                            <div className='product-container-header'>
                                <div>
                                    <h2>Top Selling Products</h2>
                                    <p>Discover the most popular grocery items loved by our customers.</p>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <Link to='/products'>View all</Link>
                                    <div>
                                        <button className={` prev-arrow-category prev-btn-${index}`}><IoMdArrowBack fill='black' size={20} /></button>
                                        <button className={` next-arrow-category next-btn-${index}`}><IoMdArrowForward fill='black' size={20} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Bootstrap grid */}
                            <div className="row product-image-container-swiper">
                                {/* Image column */}
                                <div className='col-lg-3 col-md-12 col-12 overflow-hidden'>
                                    <img src={imageUrl} className='swiper-cover-img' />
                                </div>

                                {/* Swiper slider column */}
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
                                                slidesPerView: 1,
                                            },
                                        }}>
                                        {product && product?.map((prdct) => {
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

                </section>
                : null}
        </>
    )
}

export default ProductSwiperWithImage;