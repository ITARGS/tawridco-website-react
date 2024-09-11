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


const ProductSwiperWithImage = () => {
    const imageUrl = "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=600";
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
        <section>
            <div className='container'>
                <div className='product-container-header'>
                    <div>
                        <h2>Top Selling Products</h2>
                        <p>Discover the most popular grocery items loved by our customers.</p>
                    </div>
                    <div className='d-flex align-items-center'>
                        <Link to='/products'>View all</Link>
                        <div>
                            <button className={`prev-btn prev-arrow-category`} ><IoMdArrowBack fill='black' size={20} /></button>
                            <button className={`next-btn next-arrow-category`} ><IoMdArrowForward fill='black' size={20} /></button>
                        </div>
                    </div>
                </div>
                <div className='d-flex product-image-container-swiper row align-items-center '>
                    <div className='col-3 overflow-hidden '>

                        <img src={imageUrl} className='swiper-cover-img' />
                    </div>

                    <Swiper
                        className='col-9'
                        modules={[Navigation, Pagination]}
                        navigation={{
                            prevEl: `.prev-btn`,
                            nextEl: `.next-btn`,
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
                                slidesPerView: 3.5,
                            },
                            300: {
                                slidesPerView: 1.5,
                            },
                        }}>
                        {product && product?.map((prdct) => {
                            return (
                                <SwiperSlide>
                                    <div className=''>
                                        <ProductCard product={prdct} />
                                    </div>
                                </SwiperSlide>
                            )
                        })}
                    </Swiper>
                </div>
            </div>
        </section>

    )
}

export default ProductSwiperWithImage;