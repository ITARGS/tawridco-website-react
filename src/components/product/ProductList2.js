import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsPlusCircle } from "react-icons/bs";
import { AiOutlineEye, AiOutlineCloseCircle } from 'react-icons/ai';
import { BsHeart, BsShare, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { setSelectedProductId } from '../../utils/manageLocalStorage';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
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
import { setCart, setSellerFlag } from '../../model/reducer/cartReducer';
import { setFavourite } from '../../model/reducer/favouriteReducer';
import { LuStar } from 'react-icons/lu';
import "./product.css";

const ProductList2 = React.memo(() => {
    const total_products_per_page = 12;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cookies = new Cookies();


    const closeCanvas = useRef();

    const category = useSelector(state => state.category);
    // console.log(category);
    const city = useSelector(state => state.city);
    const filter = useSelector(state => state.productFilter);
    const favorite = useSelector(state => (state.favourite));
    const setting = useSelector(state => (state.setting));
    const cart = useSelector(state => (state.cart));
    const share_parent_url = `${setting.setting && setting.setting.web_settings.website_url}/product/`;

    const [productresult, setproductresult] = useState([]);
    const [brands, setbrands] = useState(null);
    const [selectedProduct, setselectedProduct] = useState({});
    const [offset, setoffset] = useState(0);
    const [totalProducts, settotalProducts] = useState(0);
    const [currPage, setcurrPage] = useState(1);
    const [isLoader, setisLoader] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState({});
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [values, setValues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);
    const location = useLocation();
    // console.log(location);

    // useEffect(() => {
    //     dispatch(setFilterBrands({ data: [] }));
    //     dispatch(setFilterCategory({ data: null }));
    //     dispatch(setFilterSearch({ data: "" }));
    //     dispatch(setFilterSection({ data: null }));
    //     dispatch(setFilterMinMaxPrice({ data: null }));
    //     dispatch(setFilterProductSizes({ data: [] }));
    //     dispatch(setFilterSort({ data: "new" }));
    // }, [])



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
        await api.getProductbyFilter(city?.city?.id, city?.city?.latitude, city?.city?.longitude, filter, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    // console.log("Filter Product From Api ->", result);
                    setMinPrice(result.total_min_price);
                    if (result.total_min_price === result.total_max_price) {
                        setMaxPrice(result.total_max_price + 100);
                        setValues([result.total_min_price, result.total_max_price + 100]);
                    } else {
                        setMaxPrice(result.total_max_price);
                        setValues([result.total_min_price, result.total_max_price]);
                    }
                    setproductresult(result.data);
                    setSizes(result.sizes);
                    settotalProducts(result.total);
                }
                else {
                    setproductresult([]);
                    settotalProducts(0);
                    setSizes([]);
                }
                setisLoader(false);
            })
            .catch(error => console.log("error ", error));
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

        dispatch(setFilterBrands({ data: sorted_brand_ids }));
    };

    useEffect(() => {
        if (brands === null) {
            fetchBrands();
        }
        if (category?.category?.length === 0) {
            fetchCategories();
        }
        if (location.pathname === "/products")
            filterProductsFromApi({
                category_id: filter?.category_id,
                brand_ids: filter?.brand_ids.toString(),
                sort: filter?.sort_filter,
                search: filter?.search,
                limit: total_products_per_page,
                sizes: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["size"]).join(","),
                offset: offset,
                unit_ids: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["unit_id"]).join(","),
                seller_slug: filter?.seller_slug,
                country_id: filter?.country_id,
                section_id: filter?.section_id
            });

    }, [filter.search, filter.category_id, filter.brand_ids, filter.sort_filter, filter?.search_sizes]);

    useEffect(() => {
        FilterProductByPrice({
            min_price: filter.price_filter?.min_price,
            max_price: filter.price_filter?.max_price,
            category_id: filter?.category_id,
            brand_ids: filter?.brand_ids?.toString(),
            sort: filter?.sort_filter,
            search: filter?.search,
            sizes: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["size"]).join(","),
            limit: total_products_per_page,
            offset: offset,
            unit_ids: filter?.search_sizes?.filter(obj => obj.checked).map(obj => obj["unit_id"]).join(","),
            seller_slug: filter?.seller_slug,
            country_id: filter?.country_id,
            section_id: filter?.section_id
        });
    }, [filter?.price_filter, offset, cart?.cart]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);


    const FilterProductByPrice = async (filter) => {
        // setisLoader(true);
        await api.getProductbyFilter(city?.city?.id, city?.city?.latitude, city?.city?.longitude, filter, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setproductresult(result.data);
                    settotalProducts(result.total);
                }
                else {
                    setproductresult([]);
                    settotalProducts(0);
                }
                // setisLoader(false);
            })
            .catch(error => console.log("error ", error));
    };

    const filterBySize = async (filter) => {
        setproductresult(null);
        await api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, filter, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setproductresult(result.data);
                    settotalProducts(result.total);
                }
                else {
                    setproductresult([]);
                    settotalProducts(0);
                }
                setisLoader(false);
            })
            .catch(error => console.log("error ", error));
    };

    const { t } = useTranslation();

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
                                    }} className={`d-flex justify-content-between align-items-center filter-bar ${filter.brand_ids?.length != 0 ? filter.brand_ids.includes(brand.id) ? 'active' : null : null}`} key={index} >
                                        <div className='d-flex gap-3 align-items-baseline'>
                                            <div className='image-container'>
                                                <img onError={placeHolderImage} src={brand.image_url} alt="category"></img>
                                            </div>
                                            <p>{brand.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                </div>

                {minPrice !== null && maxPrice !== null ? <div className='filter-row'>
                    <h5>{t("filter")} {t("by_price")}</h5>
                    {
                        (minPrice === null || maxPrice === null)
                            ? (
                                <Loader />
                            )
                            : (
                                <div
                                    className='slider'
                                >
                                    <Range
                                        draggableTrack
                                        values={values}
                                        step={1}
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
                                                            colors: ['white', `var(--secondary-color)`, 'white'],
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
                                        renderThumb={({ props, isDragged }) => (
                                            <div
                                                {...props}
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
                                        )}
                                    />
                                </div>
                            )}
                </div> : null}

                {(sizes?.length !== 0) ? <div className='filter-row'  >
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
                </div> : null}
            </>
        );
    };
    // 
    const addtoCart = async (product_id, product_variant_id, qty) => {
        setP_id(product_id);
        setP_V_id(product_variant_id);
        setQnty(qty);
        // setisLoader(true);
        // console.log("addtoCart ProductsList Called");
        await api.addToCart(cookies.get('jwt_token'), product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            //console.log(res);
                            if (res.status === 1) {
                                setShowModal(false);
                                dispatch(setCart({ data: res }));
                                setP_id(product_id);
                                setP_V_id(product_variant_id);
                                setQnty(qty);
                            }
                        });

                }
                else if (result?.data?.one_seller_error_code == 1) {
                    dispatch(setSellerFlag({ data: 1 }));
                    // console.log(result.message);
                    // toast.error(t(`${result.message}`));
                } else {
                    toast.error(result.message);
                }
                // setisLoader(false);
            });
    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch(setCart({ data: res }));
                            else
                                dispatch(setCart({ data: null }));
                        });

                }
                else {
                    toast.error(result.message);
                }
            });
    };

    //Add to favorite
    const addToFavorite = async (product_id) => {
        await api.addToFavotite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false);
                            if (res.status === 1)
                                dispatch(setFavourite({ data: res }));
                        });
                }
                else {
                    // setisLoader(false);
                    toast.error(result.message);
                }
            });
    };

    const removefromFavorite = async (product_id) => {
        await api.removeFromFavorite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message);
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch(setFavourite({ data: res }));
                            else
                                dispatch(setFavourite({ data: null }));
                        });
                }
                else {
                    toast.error(result.message);
                }
            });
    };

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_products_per_page - total_products_per_page);
    };
    const placeholderItems = Array.from({ length: 12 }).map((_, index) => index);

    return (
        <>
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
                                        {/* 3rd Phase feature - List View */}
                                        {/* <div className={`icon ${!filter.grid_view ? 'active' : null}`} onClick={() => {
                                        dispatch({ type: ActionTypes.SET_FILTER_VIEW, payload: false });
                                    }}>
                                        <BsListUl fontSize={"2rem"} />
                                    </div>
                                    <div className={`icon ${filter.grid_view ? 'active' : null}`} onClick={() => {
                                        dispatch({ type: ActionTypes.SET_FILTER_VIEW, payload: true });
                                    }}>
                                        <BsGrid fontSize={"2rem"} />
                                    </div> */}
                                        {/* {!totalProducts ? */}
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
                                                    <div key={index} className={`${!filter.grid_view ? 'col-12 list-view ' : 'col-md-6 col-sm-6 col-lg-3 flex-column mt-3'}`}>
                                                        <Skeleton height={330} className='mt-3' borderRadius={8} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </>
                                )
                                : (
                                    <>
                                        {productresult.length > 0
                                            ? (
                                                <div className='h-100 productList_content'>
                                                    <div className="row justify-content-center flex-wrap">
                                                        {productresult.map((product, index) => (
                                                            <div key={product?.id} className={`${!filter.grid_view ? 'col-12 list-view ' : 'col-md-6 col-sm-6 col-lg-3 col-12'}`}>
                                                                <div className={`product-card my-3 ${filter.grid_view ? "flex-column " : "my-3"}`}>
                                                                    <span className='border border-light rounded-circle p-2 px-3' id='aiEye' onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setShowModal(true);
                                                                        setselectedProduct(product);
                                                                        setP_id(product.id);
                                                                        setP_V_id(product.variants[0].id);
                                                                        setQnty(product.variants[0].cart_count + 1);
                                                                    }}>
                                                                        <AiOutlineEye

                                                                        />
                                                                    </span>
                                                                    <Link to={`/product/${product.slug}`} className='text-decoration-none text-reset'>
                                                                        <div className={`image-container  ${!filter.grid_view ? 'border-end col-3 ' : 'col-12'}`} >
                                                                            <img onError={placeHolderImage} src={product.image_url} alt={product.slug} className='card-img-top' onClick={(e) => {
                                                                                e.preventDefault();
                                                                                dispatch(setSelectedProduct({ data: product.id }));
                                                                                setSelectedProductId(product.id);
                                                                                navigate(`/product/${product.slug}`);
                                                                            }} />
                                                                            {!Number(product.is_unlimited_stock) && product.variants[0].status === 0 &&
                                                                                <div className="out_of_stockOverlay">
                                                                                    <p className="out_of_stockText">{t("out_of_stock")}</p>
                                                                                </div>
                                                                            }
                                                                            {filter.grid_view ? '' : <>
                                                                                <div className='d-flex flex-row border-top product-card-footer'>
                                                                                    <div className='border-end '>
                                                                                        {

                                                                                            favorite.favorite && favorite.favorite.data.some(element => element.id === product.id) ? (
                                                                                                <button type="button" className='wishlist-product' onClick={() => {
                                                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                                                        removefromFavorite(product.id);
                                                                                                    } else {
                                                                                                        toast.error(t('required_login_message_for_cart'));
                                                                                                    }
                                                                                                }}
                                                                                                >
                                                                                                    <BsHeartFill size={16} fill='green' />
                                                                                                </button>
                                                                                            ) : (
                                                                                                <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                                                        addToFavorite(product.id);
                                                                                                    } else {
                                                                                                        toast.error(t("required_login_message_for_cart"));
                                                                                                    }
                                                                                                }}>
                                                                                                    <BsHeart size={16} /></button>
                                                                                            )}
                                                                                    </div>

                                                                                    <div className='border-end aes' style={{ flexGrow: "1" }} >
                                                                                        {product.variants[0].cart_count > 0 ? <>
                                                                                            <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                                <button type='button' className="wishlist-button" onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    if (product.variants[0].cart_count === 1) {
                                                                                                        removefromCart(product.id, product.variants[0].id);
                                                                                                        selectedVariant.cart_count = 0;
                                                                                                    }
                                                                                                    else {
                                                                                                        addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1);
                                                                                                        selectedVariant.cart_count = selectedVariant.cart_count - 1;
                                                                                                    }

                                                                                                }}><BiMinus size={20} fill='#fff' />
                                                                                                </button>

                                                                                                <div className="quantity-container text-center">
                                                                                                    <input
                                                                                                        type="number"
                                                                                                        min="1"
                                                                                                        max={product.variants[0].stock}
                                                                                                        className="quantity-input bg-transparent text-center"
                                                                                                        value={product.variants[0].cart_count}
                                                                                                        disabled
                                                                                                    />
                                                                                                </div>
                                                                                                <button type='button' className="wishlist-button" onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    if (Number(product.is_unlimited_stock)) {
                                                                                                        if (selectedVariant.cart_count < Number(setting.setting.max_cart_items_count)) {
                                                                                                            addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);


                                                                                                        } else {
                                                                                                            toast.error('Apologies, maximum product quantity limit reached!');
                                                                                                        }
                                                                                                    } else {

                                                                                                        if (product.variants[0].cart_count >= Number(product.variants[0].stock)) {
                                                                                                            toast.error(t("out_of_stock_message"));
                                                                                                        }
                                                                                                        else if (product.variants[0].cart_count >= Number(product.total_allowed_quantity)) {
                                                                                                            toast.error('Apologies, maximum product quantity limit reached');
                                                                                                        } else {

                                                                                                            addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);
                                                                                                            selectedVariant.cart_count = selectedVariant.cart_count + 1;

                                                                                                        }
                                                                                                    }

                                                                                                }}><BsPlus size={20} fill='#fff' /> </button>
                                                                                            </div>
                                                                                        </> : <>

                                                                                            <button type="button" id={`Add-to-cart-section${index}`} className='w-100 h-100 add-to-cart active' onClick={(e) => {
                                                                                                if (cookies.get('jwt_token') !== undefined) {

                                                                                                    e.preventDefault();

                                                                                                    if (product.variants[0].status) {
                                                                                                        addtoCart(product.id, product.variants[0].id, 1);
                                                                                                    } else {
                                                                                                        toast.error('oops, limited stock available');
                                                                                                    }
                                                                                                }

                                                                                                else {
                                                                                                    toast.error(t("required_login_message_for_cartRedirect"));
                                                                                                }

                                                                                            }} disabled={!Number(product.is_unlimited_stock) && product.variants[0].status === 0}>{t("add_to_cart")}</button>
                                                                                        </>}

                                                                                    </div>

                                                                                    <div className='dropup share'>
                                                                                        <button type="button" className='w-100 h-100' data-bs-toggle="dropdown" aria-expanded="false"><BsShare size={16} /></button>

                                                                                        <ul className='dropdown-menu'>
                                                                                            <li><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                                            <li><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                                            <li><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                                            <li>
                                                                                                <button type='button' onClick={() => {
                                                                                                    navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`);
                                                                                                    toast.success("Copied Succesfully!!");
                                                                                                }} className='react-share__ShareButton'> <BiLink /> <span>Copy Link</span></button>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div></>}
                                                                        </div>


                                                                        <div className="h-0 card-body product-card-body p-3 ">
                                                                            {product?.rating_count ? <div className='ratings d-flex align-items-center'>
                                                                                <LuStar className='me-2' style={{ fill: "#fead0e", stroke: "#fead0e" }} />
                                                                                <div className='border-end border-2 pe-2 me-2 avgRating'>
                                                                                    {product?.average_rating?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                                </div>
                                                                                <div>
                                                                                    {product?.rating_count}
                                                                                </div>
                                                                            </div> : null}
                                                                            <h3 onClick={(e) => {
                                                                                e.preventDefault();
                                                                                dispatch(setSelectedProduct({ data: product.id }));
                                                                                setSelectedProductId(product.id);
                                                                                navigate(`/product/${product?.slug}`);
                                                                            }} >{product.name}
                                                                            </h3>
                                                                            <div className='price'>
                                                                                {filter.grid_view ? <div>
                                                                                    <span id={`price${index}-section`} className="d-flex align-items-center">
                                                                                        <p id={`fa-rupee${index}`}>
                                                                                            {setting.setting && setting.setting.currency}
                                                                                            {product.variants[0].discounted_price === 0 ?
                                                                                                product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) :
                                                                                                product.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                                        </p>
                                                                                        {(product?.variants[0]?.price && (product?.variants[0]?.discounted_price != 0)) && (product?.variants[0]?.price !== product?.variants[0]?.discounted_price) ?
                                                                                            <span id={`price${index}-section`} className="d-flex align-items-center" >
                                                                                                <p id='relatedproduct-fa-rupee' className='fw-normal text-decoration-line-through m-0' style={{ color: "var(--sub-text-color)", fontSize: "14px" }}>{setting.setting && setting.setting.currency}
                                                                                                    {product?.variants[0]?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                                                </p>
                                                                                            </span>
                                                                                            : null}
                                                                                    </span>
                                                                                    <div className='product_varients_drop'>
                                                                                        <input type="hidden" name={`default-variant-id`} id={`productlist${index}-variant-id`} />

                                                                                        {product.variants.length > 1 ? <>
                                                                                            <div className='variant_selection' onClick={(e) => {
                                                                                                e.preventDefault(); setselectedProduct(product); setShowModal(true);
                                                                                                setP_id(product.id);
                                                                                                setP_V_id(product.variants[0].id);
                                                                                                setQnty(product.variants[0].cart_count + 1);
                                                                                            }} >
                                                                                                <span className='product_list_dropdown_span'>{<>{product.variants[0].measurement} {product.variants[0].stock_unit_name} </>}</span>
                                                                                                <IoIosArrowDown />
                                                                                            </div>
                                                                                        </>
                                                                                            :

                                                                                            <>
                                                                                                <p id={`default-product${index}-variant`} value={product.variants[0].id} className='variant_value select-arrow'>{product.variants[0].measurement + " " + product.variants[0].stock_unit_name}
                                                                                                </p>
                                                                                            </>}
                                                                                    </div>
                                                                                </div>
                                                                                    : <>
                                                                                        <div className='product_varients_drop d-flex align-items-center'>
                                                                                            {product.variants.length > 1 ? <>
                                                                                                <div className='variant_selection' onClick={(e) => {
                                                                                                    e.preventDefault(); setselectedProduct(product); setShowModal(true); setP_id(product.id);
                                                                                                    setP_V_id(product.variants[0].id);
                                                                                                    setQnty(product.variants[0].cart_count + 1);
                                                                                                }} >
                                                                                                    <span className='product_list_dropdown_span'>{<>{product.variants[0].measurement} {product.variants[0].stock_unit_name} Rs.<span className="original-price" id={`dropDown-Toggle${index}`}>{product.variants[0].toFixed(setting.setting && setting.setting.decimal_point)}</span></>}</span>
                                                                                                    <IoIosArrowDown />
                                                                                                </div>
                                                                                            </>
                                                                                                :

                                                                                                <>
                                                                                                    <p id={`default-product${index}-variant`} value={product.variants[0].id} className='variant_value select-arrow'>{product.variants[0].measurement + " " + product.variants[0].stock_unit_name}
                                                                                                    </p>
                                                                                                </>}
                                                                                            <span id={`price${index}-section`} className="d-flex align-items-center"><p id='fa-rupee'>{setting.setting && setting.setting.currency}</p> {product.variants[0].discounted_price === 0 ? product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : product.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point)}</span>
                                                                                        </div>
                                                                                        <p className="product_list_description" >

                                                                                        </p>
                                                                                    </>}
                                                                            </div>

                                                                        </div>
                                                                    </Link>
                                                                    {filter.grid_view ? <>

                                                                        <div className='d-flex flex-row border-top product-card-footer'>
                                                                            <div className='border-end '>
                                                                                {

                                                                                    favorite.favorite && favorite.favorite.status !== 0 && favorite.favorite.data.some(element => element.id === product.id) ? (
                                                                                        <button type="button" className='wishlist-product' onClick={() => {
                                                                                            if (cookies.get('jwt_token') !== undefined) {
                                                                                                removefromFavorite(product.id);
                                                                                            } else {
                                                                                                toast.error(t('required_login_message_for_cart'));
                                                                                            }
                                                                                        }}
                                                                                        >
                                                                                            <BsHeartFill size={16} fill='green' />
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                                                            if (cookies.get('jwt_token') !== undefined) {
                                                                                                addToFavorite(product.id);
                                                                                            } else {
                                                                                                toast.error(t("required_login_message_for_cart"));
                                                                                            }
                                                                                        }}>
                                                                                            <BsHeart size={16} /></button>
                                                                                    )}
                                                                            </div>

                                                                            <div className='border-end aes' style={{ flexGrow: "1" }} >
                                                                                {product.variants[0].cart_count > 0 ? <>
                                                                                    <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                        <button type='button' className="wishlist-button" onClick={() => {

                                                                                            if (product.variants[0].cart_count === 1) {
                                                                                                removefromCart(product.id, product.variants[0].id);
                                                                                                selectedVariant.cart_count = 0;
                                                                                            }
                                                                                            else {
                                                                                                addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1);
                                                                                                selectedVariant.cart_count = selectedVariant.cart_count - 1;

                                                                                            }

                                                                                        }}><BiMinus size={20} fill='#fff' /></button>
                                                                                        {/* <span id={`input-productdetail`} >{quantity}</span> */}
                                                                                        <div className="quantity-container text-center">
                                                                                            <input
                                                                                                type="number"
                                                                                                min="1"
                                                                                                max={product.variants[0].stock}
                                                                                                className="quantity-input bg-transparent text-center"
                                                                                                value={product.variants[0].cart_count}

                                                                                                disabled
                                                                                            />
                                                                                        </div>
                                                                                        <button type='button' className="wishlist-button" onClick={() => {

                                                                                            if (Number(product.is_unlimited_stock)) {

                                                                                                if (product.variants[0].cart_count < Number(setting.setting.max_cart_items_count)) {
                                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);


                                                                                                } else {
                                                                                                    toast.error('Apologies, maximum product quantity limit reached!');
                                                                                                }
                                                                                            } else {

                                                                                                if (product.variants[0].cart_count >= Number(product.variants[0].stock)) {
                                                                                                    toast.error(t("out_of_stock_message"));
                                                                                                }
                                                                                                else if (Number(product.variants[0].cart_count) >= Number(product.total_allowed_quantity)) {
                                                                                                    toast.error('Apologies, maximum product quantity limit reached');
                                                                                                } else {

                                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1);
                                                                                                }
                                                                                            }

                                                                                        }}><BsPlus size={20} fill='#fff' /> </button>
                                                                                    </div>
                                                                                </> : <>

                                                                                    <button type="button" id={`Add-to-cart-section${index}`} className='w-100 h-100 add-to-cart active' onClick={() => {
                                                                                        if (cookies.get('jwt_token') !== undefined) {



                                                                                            if (product.variants[0].status) {
                                                                                                addtoCart(product.id, product.variants[0].id, 1);
                                                                                            } else {
                                                                                                toast.error('oops, limited stock available');
                                                                                            }
                                                                                        }

                                                                                        else {
                                                                                            toast.error(t("required_login_message_for_cartRedirect"));
                                                                                        }

                                                                                    }} disabled={!Number(product.is_unlimited_stock) && product.variants[0].status === 0}>{t("add_to_cart")}</button>
                                                                                </>}

                                                                            </div>

                                                                            <div className='dropup share'>
                                                                                <button type="button" className='w-100 h-100' data-bs-toggle="dropdown" aria-expanded="false"><BsShare size={16} /></button>

                                                                                <ul className='dropdown-menu'>
                                                                                    <li className='dropDownLi'><WhatsappShareButton url={`${share_parent_url}/${product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                                    <li className='dropDownLi'><TelegramShareButton url={`${share_parent_url}/${product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                                    <li className='dropDownLi'><FacebookShareButton url={`${share_parent_url}/${product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                                    <li>
                                                                                        <button type='button' onClick={() => {
                                                                                            navigator.clipboard.writeText(`${share_parent_url}/${product.slug}`);
                                                                                            toast.success("Copied Succesfully!!");
                                                                                        }} className='react-share__ShareButton'> <BiLink /> {t("tap_to_copy")}</button>
                                                                                    </li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </> : <></>}
                                                                </div>
                                                            </div>
                                                        ))}



                                                    </div>

                                                    <div>
                                                        <Pagination
                                                            activePage={currPage}
                                                            itemsCountPerPage={total_products_per_page}
                                                            totalItemsCount={totalProducts}
                                                            pageRangeDisplayed={5}
                                                            onChange={handlePageChange.bind(this)}
                                                        />
                                                    </div>
                                                    <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} showModal={showModal} setShowModal={setShowModal}
                                                        setP_id={setP_id}
                                                        setP_V_id={setP_V_id}
                                                    />
                                                    <Popup product_id={p_id} product_variant_id={p_v_id} quantity={qnty} setisLoader={setisLoader} cookies={cookies} toast={toast} city={city} />


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

    );

});

export default ProductList2;;