import React, { useEffect, useState } from 'react'
import api from '../../api/api'
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import "./productContainer.css"
import { Link } from 'react-router-dom';

const VerticaleProductContainer = ({ section }) => {


    return (
        section?.products?.length > 0 ? <section className='products-container-section'>
            <div className='container w-100'>
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

export default VerticaleProductContainer