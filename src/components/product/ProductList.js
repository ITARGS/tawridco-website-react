import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineEye, AiOutlineCloseCircle } from 'react-icons/ai';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg';
import QuickViewModal from './QuickViewModal';
import { IoIosArrowDown } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Range, getTrackBackground } from 'react-range';
import { setCategory } from '../../model/reducer/categoryReducer';
import { setFilterBrands, setFilterByCountry, setFilterBySeller, setFilterCategory, setFilterMinMaxPrice, setFilterProductSizes, setFilterSearch, setFilterSection, setFilterSort } from '../../model/reducer/productFilterReducer';
import { setSelectedProduct } from '../../model/reducer/selectedProduct';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Popup from "../same-seller-popup/Popup";
// import "./product.css";q
import CategoryComponent from './Categories';
import { MdSignalWifiConnectedNoInternet0 } from "react-icons/md";
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import ProductCard from './ProductCard';

const ProductList2 = React.memo(() => {
    const total_products_per_page = 12;

    const dispatch = useDispatch();
    const navigate = useNavigate();


    const closeCanvas = useRef();
    const category = useSelector(state => state.category?.category);
    const city = useSelector(state => state.city);
    const filter = useSelector(state => state.productFilter);
    const setting = useSelector(state => (state.setting));
    const user = useSelector(state => (state.user));


    const [productresult, setproductresult] = useState([]);
    const [brands, setbrands] = useState(null);
    const [selectedProduct, setselectedProduct] = useState({});
    const [offset, setoffset] = useState(0);
    const [totalProducts, settotalProducts] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [values, setValues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);
    const location = useLocation();
    const [showPriceFilter, setShowPriceFilter] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState(filter?.category_id !== null ? [filter?.category_id] : []);
    const [networkError, setNetworkError] = useState(false);
    const { t } = useTranslation();

    const fetchBrands = () => {
        api.getBrands()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setbrands(result.data);
                }
                else {
                }
            })
            .catch(error => console.log("error ", error));
    };

    const fetchCategories = (id = 0) => {
        setisLoader(true);
        api.getCategory(id)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCategory({ data: result.data }));
                }
                setisLoader(false);
            })
            .catch(error => {
                setisLoader(false);
                console.log("error ", error);
            });
    };

    const filterProductsFromApi = async (filter) => {
        setisLoader(true);
        await api.getProductbyFilter(city?.city?.latitude, city?.city?.longitude, filter, user?.jwtToken)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // console.log("Filter Product From Api ->", result);
                    if (minPrice == null && maxPrice == null && filter?.price_filter == null) {
                        setMinPrice(parseInt(result.total_min_price));
                        if (result.total_min_price === result.total_max_price) {
                            setMaxPrice(parseInt(result.total_max_price) + 100);
                            setValues([parseInt(result.total_min_price), parseInt(result.total_max_price) + 100]);
                        } else {
                            setMaxPrice(parseInt(result.total_max_price));
                            setValues([parseInt(result.total_min_price), parseInt(result.total_max_price)]);
                        }
                    }
                    setproductresult(result.data);
                    setSizes(result.sizes);
                    settotalProducts(result.total);
                    setShowPriceFilter(true);
                }
                else {
                    setproductresult([]);
                    settotalProducts(0);
                    setSizes([]);
                    setShowPriceFilter(false);
                }
                setisLoader(false);
            })
            .catch(error => {
                const regex = /Failed to fetch/g;
                if (regex.test(error.message)) {
                    console.log("Network Error");
                    setNetworkError(true);
                }
                console.log(error.message);
            });
    };


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

    //onClick event of brands
    const filterbyBrands = (brand) => {
        setcurrPage(1);
        setoffset(0);
        var brand_ids = [...filter.brand_ids];

        if (brand_ids.includes(brand.id)) {
            brand_ids.splice(brand_ids.indexOf(brand.id), 1);
        }
        else {
            brand_ids.push(parseInt(brand.id));
        }

        const sorted_brand_ids = sort_unique_brand_ids(brand_ids);
        // console.log("Sorted Brand Ids ->", sorted_brand_ids);
        dispatch(setFilterBrands({ data: sorted_brand_ids }));
    };
    // console.log(category?.category);

    useEffect(() => {
        if (brands === null) {
            fetchBrands();
        }
        if (category === null) {
            fetchCategories();
        }
        if (location.pathname === "/products")
            filterProductsFromApi({
                min_price: filter.price_filter?.min_price,
                max_price: filter.price_filter?.max_price,
                category_ids: filter?.category_id,
                brand_ids: filter?.brand_ids.toString(),
                sort: filter?.sort_filter,
                search: filter?.search,
                limit: total_products_per_page,
                sizes: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["size"]).join(","),
                offset: offset,
                unit_ids: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["unit_id"]).join(","),
                seller_id: filter?.seller_id,
                country_id: filter?.country_id,
                section_id: filter?.section_id
            });

    }, [filter.search, filter.category_id, filter.brand_ids, filter.sort_filter, filter?.search_sizes, filter?.price_filter, offset]);



    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);






    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo;
    };

    const handleCheckboxToggle = (size) => {
        const updatedSizes = filter.search_sizes.map(obj =>
            (obj.size === size.size && obj.unit_id === size.unit_id && obj.short_code === size.short_code) ?
                { ...obj, checked: !obj.checked } : obj
        );

        if (!updatedSizes.some(obj => obj.size === size.size && obj.unit_id === size.unit_id && obj.short_code === size.short_code)) {
            // If the size is not found, add a new entry with checked set to true
            updatedSizes.push({ size: size.size, short_code: size.short_code, unit_id: size.unit_id, checked: true });
        }

        dispatch(setFilterProductSizes({
            data: updatedSizes,
        }));
    };


    const Filter = () => {
        return (
            <>
                <div className='filter-row'>
                    <h5 className='product-filter-headline d-flex w-100 align-items-center justify-content-between'>{t("brands")}
                        <span className='btn border-0' onClick={() => {
                            dispatch(setFilterBrands({ data: [] }));
                            dispatch(setFilterCategory({ data: null }));
                            dispatch(setFilterSearch({ data: "" }));
                            dispatch(setFilterSection({ data: null }));
                            dispatch(setFilterMinMaxPrice({ data: null }));
                            dispatch(setFilterProductSizes({ data: [] }));
                            dispatch(setFilterSort({ data: "new" }));
                            dispatch(setFilterBySeller({ data: "" }));
                            dispatch(setFilterByCountry({ data: "" }));
                            dispatch(setFilterCategory({ data: null }));
                            setSelectedCategories([]);
                            setMinPrice(null);
                            setMaxPrice(null);
                        }}>{t("clear_filters")}</span></h5>
                    {brands === null
                        ? (
                            <Loader />
                        )
                        : (
                            <>
                                {brands.map((brand, index) => (
                                    <div whiltap={{ scale: 0.8 }} onClick={() => {
                                        filterbyBrands(brand);
                                        closeCanvas.current.click();
                                    }} className={`d-flex justify-content-between align-items-center filter-bar border-bottom ${filter.brand_ids?.length != 0 ? filter.brand_ids.includes(brand.id) ? 'active' : null : null}`} key={index} >
                                        <div className='d-flex gap-3 align-items-baseline'>
                                            <div className='image-container'>
                                                {/* <img onError={placeHolderImage} src={brand.image_url} alt="category" /> */}
                                                <ImageWithPlaceholder src={brand.image_url} alt="brandImage" />
                                            </div>
                                            <p>{brand.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                </div>
                <div className='filter-row'>
                    <h5 className='product-filter-headline d-flex w-100 align-items-center justify-content-start'>
                        {t("categories")}
                    </h5>
                    {/* {category?.map((ctg) => (
                        <div key={ctg?.id}
                            // onClick={() => {
                            //     handleSelectedCategories(ctg?.id);
                            // }}
                            className={`d-flex justify-content-between align-items-center filter-bar ${filter?.category_id?.split(",")?.includes(String(ctg?.id)) ? 'active' : ""}`}>
                            <div className='d-flex gap-3 align-items-baseline'>
                                <div className='image-container'>
                                    <img onError={placeHolderImage} src={ctg.image_url} alt="category"></img>
                                </div>
                                <p>{ctg.name}</p>
                            </div>
                            <div className='d-flex justify-content-end'>
                                <IoIosArrowDown size={20} />
                            </div>
                        </div>
                    ))} */}
                    <CategoryComponent data={category} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
                </div>
                {showPriceFilter ?
                    <div className='filter-row priceFilter'>
                        <h5> {t("filter")} {t("by_price")}</h5>
                        {
                            (minPrice === null || maxPrice === null)
                                ? (
                                    <Loader />
                                )
                                : (
                                    <div className='slider'>
                                        <Range
                                            draggableTrack
                                            values={values}
                                            step={0.01}
                                            min={minPrice}
                                            max={maxPrice}
                                            onChange={(newValues) => {
                                                setValues(newValues);
                                            }}
                                            i18nIsDynamicList
                                            onFinalChange={(newValues) => {
                                                // console.log(newValues);
                                                dispatch(setFilterMinMaxPrice({ data: { min_price: newValues[0], max_price: newValues[1] } }));
                                            }}
                                            renderTrack={({ props, children }) => (
                                                <div
                                                    key={`track-${props['aria-valuemax']}-${props['aria-valuemin']}`}
                                                    className='track'
                                                    onMouseDown={props.onMouseDown}
                                                    onTouchStart={props.onTouchStart}
                                                    style={{
                                                        ...props.style,
                                                        height: '36px',
                                                        display: 'flex',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <div
                                                        ref={props.ref}
                                                        style={{
                                                            height: '5px',
                                                            width: '100%',
                                                            borderRadius: '4px',
                                                            background: getTrackBackground({
                                                                values,
                                                                colors: ['var(--second-cards-color)', `var(--secondary-color)`, 'var(--second-cards-color)'],
                                                                min: minPrice,
                                                                max: maxPrice,

                                                            }),
                                                            alignSelf: 'center',
                                                        }}
                                                        className='track-1'
                                                    >
                                                        {children}
                                                    </div>
                                                </div>
                                            )}
                                            renderThumb={({ props, isDragged }) => {
                                                const { key, ...remainingProps } = props;
                                                return (
                                                    <div
                                                        {...remainingProps}
                                                        className='thumb'
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            // Handle keyboard events here
                                                            if (e.key === 'ArrowLeft') {
                                                                // setMaxPrice(maxPrice - 1);
                                                                setValues([values[0] - 1, values[1]]);
                                                            } else if (e.key === 'ArrowRight') {
                                                                // setMinPrice(minPrice + 1);
                                                                setValues([values[0] + 1, values[1]]);
                                                            }
                                                        }}
                                                    >   {props['aria-valuenow']}

                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                )
                        }
                    </div> : null}

                {(sizes?.length !== 0 && sizes?.length !== undefined) ?
                    <div className='filter-row'>
                        <h2 className='product-filter-headline d-flex w-100 align-items-center justify-content-between'>
                            <span>{t("Filter By Sizes")}</span>

                        </h2>
                        {!sizes
                            ?
                            (<Loader />)
                            :
                            (<div id='filterBySizeContainer'>
                                {sizes.map((size, index) => (
                                    <div
                                        whiletap={{ scale: 0.8 }}
                                        onClick={() => {
                                            closeCanvas.current.click();
                                        }} className={`d-flex justify-content-between align-items-center px-4 filter-bar`} key={index}>
                                        <div className='d-flex'>
                                            <p>{size.size} {size.short_code}</p>
                                        </div>
                                        <input type='checkbox'
                                            checked={filter?.search_sizes.some(obj => obj.size === size.size && obj.checked && obj.short_code === size.short_code && obj.unit_id === size.unit_id)}
                                            onChange={() => {
                                                handleCheckboxToggle(size);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            )
                        }
                    </div> : null
                }
            </>
        );
    };





    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_products_per_page - total_products_per_page);
    };

    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);



    return (
        <>
            {!networkError ?
                <>
                    <div id='productListingBreadcrumb' className='w-100 breadCrumbs'>
                        <div className='container d-flex align-items-center gap-2'>
                            <div className='breadCrumbsItem'>
                                <Link to={"/"}>{t("home")}</Link>
                            </div>
                            <div className='breadCrumbsItem'>/</div>
                            <div className='breadCrumbsItem'>
                                <Link className={location.pathname === "/products" ? "breadCrumbActive" : ""} to={"/products"}>{t("products")}</Link>
                            </div>
                        </div>
                    </div>
                    <section id="productlist" className='container' onContextMenu={() => { return false; }}>

                        <div className='row justify-content-center' id='products'>
                            <div className="hide-desktop col-3 offcanvas offcanvas-start" tabIndex="-1" id="filteroffcanvasExample" aria-labelledby="filteroffcanvasExampleLabel" >
                                <div className="canvas-header">
                                    <div className='site-brand'>
                                        <img src={setting.setting && setting.setting.web_settings.web_logo} height="50px" alt="logo"></img>
                                    </div>

                                    <button type="button" className="close-canvas" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeCanvas} onClick={() => {


                                    }}><AiOutlineCloseCircle fill='black' /></button>
                                </div>
                                {Filter()}
                            </div>


                            {/* filter section */}
                            <div className='flex-column col-2 col-md-3 col-md-auto filter-container hide-mobile-screen' style={{ gap: "30px" }}>
                                {Filter()}
                            </div>

                            {/* products according to applied filter */}
                            <div className='d-flex flex-column col-md-9 col-12 h-100 productList_container' style={{ gap: '20px' }}>
                                <div className="row">
                                    {/* {console.log(totalProducts, isLoader)} */}
                                    {!isLoader ? (<>
                                        <div className='d-flex col-12 flex-row justify-content-between align-items-center filter-view'>
                                            <div className='d-flex gap-3'>
                                                <span className='total_product_count'>{totalProducts} - {t("products_found")}</span>

                                            </div>

                                            <div className="select">
                                                {/* {!totalProducts ? */}
                                                <select className="form-select" aria-label="Default select example" defaultValue={filter.sort_filter} onChange={(e) => {
                                                    dispatch(setFilterSort({ data: e.target.value }));
                                                }}>
                                                    <option value="new">{t("newest_first")}</option>
                                                    <option value="old">{t("oldest_first")}</option>
                                                    <option value="high">{t("high_to_low")}</option>
                                                    <option value="low">{t("low_to_high")}</option>
                                                    <option value="discount">{t("discount_high_to_low")}</option>
                                                    <option value="popular">{t("popularity")}</option>
                                                </select>


                                            </div>
                                        </div>
                                    </>) :
                                        (
                                            <Skeleton height={49} borderRadius={8} />
                                        )
                                    }



                                    {productresult === null || isLoader
                                        ? (
                                            <>
                                                <div className='h-100 productList_content'>
                                                    <div className='row flex-wrap'>
                                                        {placeholderItems.map((index) => (
                                                            <div key={index} className={`${!filter.grid_view ? 'col-6 list-view ' : 'col-md-6 col-sm-6 col-lg-4 flex-column mt-3'}`}>
                                                                <Skeleton height={330} className='mt-3' borderRadius={8} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </>
                                        )
                                        : (
                                            <>
                                                {productresult.length > 0 && isLoader == false
                                                    ? (
                                                        <div className='h-100 productList_content'>
                                                            <div className="row  flex-wrap">
                                                                {productresult.map((product, index) => (
                                                                    <div key={product?.id} className={`${!filter.grid_view ? 'col-6 list-view ' : 'col-md-6 col-sm-6 col-lg-4 col-6 my-2'}`}>
                                                                        <ProductCard product={product} />
                                                                    </div>
                                                                ))}



                                                            </div>

                                                            <div>
                                                                {(totalProducts > total_products_per_page) ?
                                                                    <Pagination
                                                                        itemClass='productListingItems'
                                                                        activePage={currPage}
                                                                        itemsCountPerPage={total_products_per_page}
                                                                        totalItemsCount={totalProducts}
                                                                        pageRangeDisplayed={5}
                                                                        onChange={handlePageChange.bind(this)}
                                                                    /> : null
                                                                }
                                                            </div>
                                                        </div>


                                                    )
                                                    : (
                                                        <div className='no-product'>
                                                            <img src={No_Orders} style={{ width: '40%' }} alt='no-product' className='img-fluid'></img>
                                                            <p>No Products Found</p>
                                                        </div>
                                                    )}



                                            </>

                                        )}
                                </div>
                            </div>

                        </div>

                    </section>
                </>
                :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>}
        </>

    );

});

export default ProductList2;;