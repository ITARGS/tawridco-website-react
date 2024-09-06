import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import "./productContainer.css"

const ProductContainer = () => {
    const city = useSelector(state => state.city);
    const [product, setProducts] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.getProductbyFilter(city?.city?.latitude, city?.city?.longitude)
                const { data } = await res.json();
                setProducts(data);
            } catch (error) {
                console.log(error)
            }


        }
        fetchData();
    }, [])

    return (
        <section className='products-container-section'>
            <div className='container w-100'>
                <div>
                    <div className='product-container-header'>
                        <div>
                            <h2>Top Selling Products</h2>
                            <p>Discover the most popular grocery items loved by our customers.</p>
                        </div>
                        <div>
                            <a>View all</a>
                        </div>
                    </div>
                    <div className='product-containers row my-4'>
                        {product && product?.slice(0, 8)?.map((prdct) => {
                            return (
                                <div className='col-md-4 col-sm-6 col-lg-3 col-12 m-0 p-0'>
                                    <ProductCard product={prdct} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductContainer