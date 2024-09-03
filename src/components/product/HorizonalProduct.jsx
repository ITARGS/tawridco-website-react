import React from 'react'
import "./horizontalProduct.css"
import image from "../../utils/eGrocerdemoimage.jpg"
import { Rate } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { FaShoppingBasket } from 'react-icons/fa';
const HorizonalProduct = () => {
    return (
        <div className='horizontal-product-grid'>
            <div className='row'>
                <div className="product-image col-6" >

                    <a className="image">
                        <img src={image} />
                    </a>
                    <ul className="product-links">
                        <li><a data-tip="Add to Wishlist"><i className="fas fa-heart"></i></a></li>
                        <li onClick={() => {
                            // setselectedProduct(product)
                            // setShowModal(true)
                        }}><a data-tip="Quick View" ><i className="fa fa-eye"></i></a></li>
                    </ul>


                    <span className="product-discount-label">30% OFF</span>


                </div>
                <div className="horizontal-product-content col-6">
                    <div className='horizontal-product-head'>
                        <div className='horizontal-product-title'>
                            <h3 className="title"><a href="#"> Apple </a></h3>
                            <div className='rating-container'>
                                <Rate
                                    disabled
                                    defaultValue={2.6}
                                    allowHalf={true}
                                    style={{ fontSize: 15 }}
                                    characterRender={(node, { index }) => (
                                        <span className={index + 1 <= 4.2 ? "filledStar" : "emptyStar"}>
                                            {index + 1 <= 4.2 ? <StarFilled /> : <StarOutlined />}
                                        </span>
                                    )}
                                />
                                <p>(4.2)</p>
                            </div>
                        </div>

                        <p className='horizontal-product-price'>$32.00</p>

                    </div>

                    <div className='horizontal-product-buttons'>
                        <button className='qty-button'>1 Pack</button>
                        <button className='price-button'><FaShoppingBasket className='mx-2' size={20} />Add</button>
                    </div>


                </div>
            </div>
        </div >
    )
}

export default HorizonalProduct