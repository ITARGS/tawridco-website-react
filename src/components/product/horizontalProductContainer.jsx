import React, { useEffect, useState } from 'react'
import "./productContainer.css"
import { useSelector } from 'react-redux';
import api from '../../api/api';
import HorizontalProductcard from "./HorizonalProductCard"

const HorizontalProductContainer = () => {

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
        fetchData();
    }, [])
    return (
        <section className='horizontal-product-section my-4'>
            <div className='container '>
                <div className='product-container-header'>
                    <div>
                        <h2>featured Products</h2>
                        <p>Discover our handpicked selection of top-rated grocery products.</p>
                    </div>
                    <div>
                        <a>View all</a>
                    </div>
                </div>
                <div className='horizontal-products row my-4'>
                    {product?.slice(0, 6)?.map((prdct) => {
                        return (
                            <div className='col-md-6 col-sm-6 col-lg-4 col-12 my-2'>
                                <HorizontalProductcard product={prdct} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>

    )
}

export default HorizontalProductContainer