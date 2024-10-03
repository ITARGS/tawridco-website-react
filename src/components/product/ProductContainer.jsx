import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useSelector } from 'react-redux';
import ProductCard from '../NewComponents/ProductCard';
import "./productContainer.css"
import { Link } from 'react-router-dom';

const ProductContainer = () => {
    const city = useSelector(state => state.city);
    const setting = useSelector(state => (state.setting));
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
        if (product?.lenght == 0) {
            fetchData();
        }
    }, [product])
    return (
        product?.length > 0 ? <section className='products-container-section'>
            <div className='container w-100'>
                <div>
                    <div className='product-container-header'>
                        <div>
                            <h2>Top Selling Products</h2>
                            <p className="d-none d-md-block">Discover the most popular grocery items loved by our customers.</p>
                        </div>
                        <div className='d-flex'>
                            <Link to="/products" >View all</Link>
                        </div>
                    </div>
                    <div className='product-containers row my-4'>
                        {product?.length > 0 && product?.slice(0, 8)?.map((prdct) => {
                            return (
                                <div className='col-md-4 col-sm-6 col-lg-3 col-12 m-0 p-0'>
                                    <ProductCard product={prdct} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section> : null

    )
}

export default ProductContainer