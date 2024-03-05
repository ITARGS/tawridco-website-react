import React, { useEffect, useState } from 'react';
import { setFilterBrands } from '../../model/reducer/productFilterReducer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import coverImg from '../../utils/cover-img.jpg';
import "../category/category.css";
import useShopBySellers from '../../hooks/useShopBySellers';
import Cookies from 'universal-cookie';
import Pagination from 'react-js-pagination';
import Skeleton from 'react-loading-skeleton';

const ShopBySellersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const cookies = new Cookies();

    const [limit, setLimit] = useState(12);
    const [offset, setOffset] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);


    const setting = useSelector(state => state.setting);
    const filter = useSelector(state => state.productFilter);
    const city = useSelector(state => state.city.city);

    const { data, totalData, loading, error } = useShopBySellers(cookies.get("jwt_token"), city.latitude, city.longitude, limit, offset);

    const sort_unique_brand_ids = (int_brand_ids) => {
        if (int_brand_ids.length === 0) return int_brand_ids;
        int_brand_ids = int_brand_ids.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [int_brand_ids[0]];
        for (var i = 1; i < int_brand_ids.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
                ret.push(int_brand_ids[i]);
            }
        }
        return ret;
    };

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
                        <h5>{t("sellers")}</h5>
                        <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("sellers")}</span></p>
                    </div>
                </div>

                <div className='container' style={{ padding: "30px 0px" }}>
                    {loading ?
                        <div className='row justify-content-center mx-3'>
                            {placeholderItems.map((index) => (
                                <div key={index} className='col-md-3 col-lg-2 col-6 col-sm-3 my-3'>
                                    <Skeleton height={250} />
                                </div>
                            ))
                            }
                        </div>
                        :
                        <div className='row justify-content-center'>
                            {data?.map((ctg, index) => (
                                <div className="col-md-3 col-lg-2 col-6 col-sm-3 my-3 content" key={index} onClick={() => {

                                    // setSelectedBrands((prev) => [...prev, ...brand.id])
                                    var brand_ids = [...filter.brand_ids];

                                    if (brand_ids.includes(ctg.id)) {
                                        brand_ids.splice(ctg.indexOf(ctg.id), 1);
                                    }
                                    else {
                                        brand_ids.push(parseInt(ctg.id));
                                    }

                                    const sorted_brand_ids = sort_unique_brand_ids(brand_ids);
                                    dispatch(setFilterBrands({ data: sorted_brand_ids }));
                                    // dispatch({ type: ActionTypes.SET_FILTER_BRANDS, payload: sorted_brand_ids });
                                    navigate('/products');
                                }}>

                                    <div className='card'>
                                        <img onError={placeHolderImage} className='card-img-top' src={ctg.logo_url} alt='sellers' loading='lazy' />
                                        <div className='card-body' style={{ cursor: "pointer" }} >
                                            <p>{ctg.name} </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    }

                </div>
            </section>

            {(limit < totalData) &&
                <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={limit}
                    totalItemsCount={totalData}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange.bind(this)}
                />
            }
        </>
    );
};

export default ShopBySellersPage;