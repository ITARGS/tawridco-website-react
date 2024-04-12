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

const HomeContainer = ({ OfferImagesArray, BelowSliderOfferArray, BelowCategoryOfferArray }) => {
    const shop = useSelector((state) => state.shop);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return (
        // elementor-section-height-min-height elementor-section-items-stretch elementor-section-boxed elementor-section-height-default
        <section id="home" className='home-section container home-element section'>
            {/* Slider & Category */}
            {OfferImagesArray?.map((offer) => (
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

            <div className='home-container row'>
                <div className="col-md-12 p-0 col-12">
                    <Slider />
                </div>
            </div>

            {BelowSliderOfferArray?.map((offer) => (
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

            {shop.shop?.is_category_section_in_homepage ?
                <div className='category_section'>
                    <div className="container">

                        <Category />

                    </div>
                </div>
                : <></>}


            {BelowCategoryOfferArray?.map((offer) => (
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


        </section>

    );
};

export default HomeContainer;
