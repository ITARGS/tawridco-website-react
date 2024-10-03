import React, { useEffect, useState } from 'react'
import "./productContainer.css"
import { useSelector } from 'react-redux';
import api from '../../api/api';
import HorizontalProductcard from "./HorizontalProductCard"
import { Link } from 'react-router-dom';

const HorizontalProductContainer = ({ section }) => {
    return (
        <section className='horizontal-product-section my-4'>
            {/* <div className='container '> */}
            <div className='product-container-header'>
                <div>
                    <h2>{section?.title}</h2>
                    <p className="d-none d-md-block">{section?.short_description}</p>

                </div>
                <div className='d-flex' >
                    <Link to="/products" >View all</Link>
                </div>
            </div>
            <div className='horizontal-products row my-4'>
                {section?.products?.slice(0, 6)?.map((prdct) => {
                    return (
                        <div className='col-md-6 col-sm-6 col-lg-4 col-12 my-2'>
                            <HorizontalProductcard product={prdct} />
                        </div>
                    )
                })}
            </div>
            {/* </div> */}
        </section>

    )
}

export default HorizontalProductContainer