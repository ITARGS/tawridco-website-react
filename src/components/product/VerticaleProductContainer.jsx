import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import "./productContainer.css"
import { Link, useNavigate } from 'react-router-dom';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';

const VerticaleProductContainer = ({ section }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cssmode } = useSelector(state => state.cssmode);
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
            {section?.products?.length > 0 ? <section className='products-container-section' style={cssmode == "dark" ?
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
                                <p className="d-none d-md-block">{section?.short_description}</p>
                            </div>
                            <div className='d-flex'>
                                <Link to="/products" >View all</Link>
                            </div>
                        </div>
                        <div className='product-containers row my-4'>
                            {section?.products?.length > 0 && section?.products?.slice(0, 8)?.map((prdct) => {
                                return (
                                    <div className='col-md-4 col-xs-6  col-sm-6 col-lg-3 col-12 m-0 p-0 custom-col'>
                                        <ProductCard product={prdct} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section> : null}
            {promotionImage?.map((offer) => (
                <div className='col-md-12 col-12  container promotion-img' key={offer?.id} onClick={() => {
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
        </>
    )
}

export default VerticaleProductContainer