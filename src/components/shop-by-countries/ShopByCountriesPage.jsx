import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setFilterBrands, setFilterByCountry } from '../../model/reducer/productFilterReducer';
import coverImg from '../../utils/cover-img.jpg';
import { useTranslation } from 'react-i18next';
import "../category/category.css";
import Pagination from 'react-js-pagination';
import useShopByCountries from '../../hooks/useShopByCountries';
import Cookies from 'universal-cookie';
import Loader from '../loader/Loader';
import Skeleton from 'react-loading-skeleton';

const ShopByCountriesPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const cookies = new Cookies();

    const [limit, setLimit] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [offset, setOffset] = useState(0);

    const { data, totalData, loading, error } = useShopByCountries(cookies.get("jwt_token"), limit, offset);
    const setting = useSelector(state => state.setting);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

    }, []);

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
        setOffset(pageNo * limit - limit);
    };


    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);


    return (
        <>
            <section id='allcategories'>
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='page-heading'>
                        <h5>{t("countries")}</h5>
                        <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("countries")}</span></p>
                    </div>
                </div>

                <div className='container' style={{ padding: "30px 0px" }}>
                    {loading ?

                        <div className='row justify-content-center mx-3'>
                            {placeholderItems.map((index) => (
                                <div key={index} className='col-md-3 col-lg-2 col-6 col-sm-3 my-3 content'>
                                    <Skeleton height={250} />
                                </div>
                            ))}
                        </div>
                        : <div className='row justify-content-center'>
                            {data?.map((country, index) => (
                                <div className="col-md-3 col-lg-2 col-6 col-sm-3  my-3 content" key={index} onClick={() => {
                                    dispatch(setFilterByCountry({ data: country?.id }));
                                    navigate('/products');
                                }}>

                                    <div className='card'>
                                        <img onError={placeHolderImage} className='card-img-top' src={`${process.env.REACT_APP_API_URL}/storage/${country.logo}`} alt='countryLogo' loading='lazy' />
                                        <div className='card-body' style={{ cursor: "pointer" }} >
                                            <p>{country.name} </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                </div>
                {limit < totalData &&
                    <Pagination
                        activePage={currentPage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalData}
                        pageRangeDisplayed={5}
                        onChange={handlePageChange.bind(this)}

                    />
                }
            </section>
        </>
    );
};

export default ShopByCountriesPage;