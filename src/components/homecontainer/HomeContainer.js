import React from 'react';
import Category from '../category/Category';
import Slider from '../sliders/Slider';
import './homecontainer.css';
import { useDispatch, useSelector } from 'react-redux';
import Brand from '../brands/Brand';
import ShopByCountries from '../shop-by-countries/ShopByCountries';
import ShopBySellers from '../shop-by-seller/ShopBySellers';
import { useNavigate } from 'react-router-dom';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';
import HorizonalProduct from '../product/HorizonalProductCard';
import ProductContainer from '../product/ProductContainer';
import HorizontalProductContainer from "../product/horizontalProductContainer"
import ProductSwiperWithImage from '../product/ProductSwiperWithImage';

const HomeContainer = ({ OfferImagesArray, BelowSliderOfferArray, BelowCategoryOfferArray }) => {
    const shop = useSelector((state) => state.shop);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return (
        // elementor-section-height-min-height elementor-section-items-stretch elementor-section-boxed elementor-section-height-default
        <section id="home" className='home-section  home-element section'>
            {/* Slider & Category */}
            <div className='container'>
                {OfferImagesArray?.map((offer) => (
                    <div className='col-md-12 p-0 col-12 my-3 my-md-5' key={offer?.id} onClick={() => {
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
            <div className='home-container row mx-5'>
                <div className="col-md-12 p-0 col-12">
                    <Slider />
                </div>
            </div>

            {BelowSliderOfferArray?.map((offer) => (
                <div className='col-md-12 p-0 col-12 my-3 my-md-5 container' key={offer?.id} onClick={() => {
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
            {/* <div className='row mb-2'>
                <div className='d-flex col-lg-4'>

                    <HorizonalProduct />
                </div>
                <div className='d-flex col-lg-4'>

                    <HorizonalProduct />
                </div>
                <div className='d-flex col-lg-4'>

                    <HorizonalProduct />
                </div>
                <div className='d-flex col-lg-4'>

                    <HorizonalProduct />
                </div>
            </div> */}

            {shop.shop?.is_category_section_in_homepage ?
                <div className='category_section'>
                    <div className="container">

                        <Category />

                    </div>
                </div>
                : <></>}


            {BelowCategoryOfferArray?.map((offer) => (
                <div className='col-md-12 p-0 col-12 my-3 my-md-5 container' key={offer?.id} onClick={() => {
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
            {shop.shop?.is_brand_section_in_homepage ?
                <div className='category_section'>
                    <div className="container">
                        <Brand />
                    </div>
                </div>
                : <></>}
            {shop.shop?.is_country_section_in_homepage ?
                <div className='category_section'>
                    <div className='container'>
                        <ShopByCountries />
                    </div>
                </div>
                : <></>}
            {shop.shop?.is_seller_section_in_homepage ?
                <div className='category_section'>
                    <div className='container'>
                        <ShopBySellers />
                    </div>
                </div>
                : <></>}

            {/* <ProductContainer /> */}
            {/* <HorizontalProductContainer /> */}
            {/* <ProductSwiperWithImage /> */}
        </section>

    );
};

export default HomeContainer;
