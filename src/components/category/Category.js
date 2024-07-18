import React, { useRef, useEffect } from 'react';
import './category.css';
import api from '../../api/api';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from '../../model/action-type';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { setCategory, setSelectedCategory } from '../../model/reducer/categoryReducer';
import { clearAllFilter, setFilterCategory } from '../../model/reducer/productFilterReducer';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';


const Category = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const setting = useSelector(state => (state.setting));
    const { t } = useTranslation();

    const sliderRef = useRef(null);

    const handlePrevClick = () => {
        sliderRef.current.slickPrev();
    };

    const handleNextClick = () => {
        sliderRef.current.slickNext();
    };


    const shop = useSelector(state => state.shop);
    const category = shop && shop?.shop?.categories;

    const fetchCategory = (id = 0) => {
        api.getCategory({
            id: 0,
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCategory({ data: result.data }));
                }
            })
            .catch(error => {
                console.log("error ", error);
            }
            );
    };
    useEffect(() => {
        // fetchCategory()
    }, []);

    const selectCategory = (category) => {
        dispatch(clearAllFilter())
        dispatch(setFilterCategory({ data: category.id }));
        if (category?.has_child === true) {
            navigate(`/category/${category.slug}`);
            dispatch(setSelectedCategory(category));
            // navigate(`/category/${category.slug}`, { state: { categoryName: category.name } });
        } else {
            navigate('/products');

        }

    };
    const settings = {
        infinite: false,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        direction: 'rtl',
        pauseOnDotsHover: false,
        pauseOnFocus: true,
        slidesToShow: 5,
        slidesPerRow: 1,
        initialSlide: 0,

        // Add custom navigation buttons using Font Awesome icons
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                }
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 425,
                settings: {
                    slidesToShow: 2,

                }
            }
        ]
    };
    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };
    return (

        <>
            {(category && (category?.length > 0))
                ?
                <>
                    <div className="row category_section_header">
                        <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
                            <div className="title d-md-flex align-items-center ">
                                <p>{t('shop_by')} {t('categories')}</p>
                                <Link className='d-none d-md-block' to='/category/all'>{t('see_all')} {t('categories')}<AiOutlineArrowRight size={15} className='see_category_arrow' /> </Link>
                            </div>
                            <div className=' d-md-none'>
                                <Link className='category_button' to='/category/all'>{t('see_all')}</Link>
                            </div>
                            <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
                                <button className='prev-arrow-category' onClick={handlePrevClick}><FaChevronLeft fill='black' size={20} /></button>
                                <button className='next-arrow-category' onClick={handleNextClick}><FaChevronRight fill='black' size={20} /></button>
                            </div>
                        </div>
                    </div>
                    <div className="caegory_section_content">

                        <div className='row ' id="expandCategory">
                            <Slider {...settings} ref={sliderRef}>

                                {
                                    category?.map((ctg, index) => (
                                        <div className="col-md-12" key={index}>
                                            <div className='category-container '>

                                                {ctg.has_child
                                                    ? (
                                                        <Card onClick={() => selectCategory(ctg)}>
                                                            {/* <Card.Img onError={placeHolderImage} variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' /> */}
                                                            <ImageWithPlaceholder src={ctg.image_url} alt={ctg.subtitle} className={"card-img-top category_image"} />
                                                            <Card.Body className='card-body'>
                                                                <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                            </Card.Body>
                                                        </Card>

                                                    )
                                                    : (


                                                        <Card onClick={() => selectCategory(ctg)}>
                                                            {/* <Card.Img onError={placeHolderImage} variant='top' src={ctg.image_url} alt={ctg.subtitle} className='card-img-top category_image' /> */}
                                                            <ImageWithPlaceholder src={ctg.image_url} alt={ctg.subtitle} className={'card-img-top category_image'} />
                                                            <Card.Body className='card-body'>
                                                                <Card.Title className="card-title">{ctg.name}</Card.Title>
                                                            </Card.Body>
                                                        </Card>

                                                    )}

                                            </div>

                                        </div>

                                    ))
                                }


                            </Slider>
                        </div>
                    </div>


                </>
                : null}
        </>
    );
};

export default Category;
