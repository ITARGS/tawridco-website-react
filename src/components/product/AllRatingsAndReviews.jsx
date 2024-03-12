import { useParams } from "react-router-dom";
import useGetProductRatingsById from "../../hooks/useGetProductRatingsById";
import { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import Cookies from "universal-cookie";
import { useSelector } from "react-redux";
import { formatDate, formatTime } from "../../utils/formatDate";
import Loader from "../loader/Loader";
import { ProgressBar } from "react-bootstrap";
import StarFilledSVG from "../../utils/StarFilled.svg";
import StarUnfilledSVG from "../../utils/StarUnfilled.svg";
import { useTranslation } from "react-i18next";
import Pagination from "react-js-pagination";
import "./all-ratings.css";
import NoRatingsFound from "../../utils/No_Review_Found.svg";

const AllRatingsAndReviews = () => {
    const { slug } = useParams();
    const cookies = new Cookies();
    const { t } = useTranslation();

    const city = useSelector(state => state.city);
    const setting = useSelector(state => state.setting);

    const [currPage, setCurrPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [offset, setOffset] = useState(0);
    const [productId, setProductId] = useState(0);
    const [product, setProduct] = useState("");
    const [imageMappingLength, setImageMappingLength] = useState(5);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const getProductData = async () => {

            await api.getProductbyFilter(city.city?.id, city.city?.latitude, city.city?.longitude, { slug: slug }, cookies.get('jwt_token'))
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        setProduct(result?.data?.[0]);
                        setProductId(result?.data?.[0].id);
                    }
                    else {
                    }
                })
                .catch(error => console.log(error));
        };
        getProductData();
    }, [slug]);

    const { productRating, totalData, loading: Loading, error } = useGetProductRatingsById(cookies.get("jwt_token"), productId, limit, offset);

    const calculatePercentage = (totalRating, starWiseRating) => {
        const percentage = (starWiseRating * 100) / totalRating;
        return percentage;
    };
    const handlePageChange = (pageNum) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrPage(pageNum);
        setOffset(pageNum * limit - limit);
    };

    useEffect(() => {
        const adjustImageLengthAccWindowSize = () => {
            if (window.innerWidth <= 320 && window.innerWidth <= 425) {
                setImageMappingLength(2);
            } else if (window.innerWidth < 425) {
                setImageMappingLength(3);
            } else if (window.innerWidth > 425 && window.innerWidth <= 485) {
                setImageMappingLength(4);
            } else if (window.innerWidth > 485 && window.innerWidth <= 760) {
                setImageMappingLength(5);
            }
            else if (window.innerWidth > 761 && window.innerWidth <= 930) {
                setImageMappingLength(4);
            }
            else if (window.innerWidth > 930 && window.innerWidth <= 1100) {
                setImageMappingLength(5);
            }
            else if (window.innerWidth > 1100 && window.innerWidth <= 1200) {
                setImageMappingLength(6);
            }
            else {
                setImageMappingLength(7);
            }
        };

        window.addEventListener("resize", adjustImageLengthAccWindowSize);

        return () => {
            window.removeEventListener("resize", adjustImageLengthAccWindowSize);
        };
    }, []);
    return (
        <>

            <h5 className="ms-5 mt-5 allReviewTitle">{t("all_customer_reviews")}</h5>

            <div id='all-ratings-section' className={`${productRating?.rating_list?.length != 0 ? "row justify-content-center m-5" : ""} `}>
                {Loading &&
                    <>
                        <Loader width={"100%"} height={"500px"} />
                    </>

                }
                {((productRating?.rating_list?.length !== 0) && !Loading) &&
                    <>

                        <div className='col-md-5 mb-5 p-5'>
                            <div className="d-flex flex-row gap-5 productContainer">
                                <img src={product?.image_url} alt="productLogo" className="productLogo" />
                                <div className="d-flex flex-column align-items-start">
                                    <div className="productName">
                                        {product?.name}
                                    </div>
                                    <div className="productPrice">
                                        {setting.setting && setting.setting.currency} {product?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                    </div>
                                </div>
                            </div>
                            <h5 className='title'>{t("rating_and_reviews")}</h5>

                            <div className='row justify-content-between ratingContainer'>

                                <div className='d-flex flex-row justify-content-start align-items-center gap-4 ratingCircleContainer'>
                                    <div className='ratingCircle'>
                                        {productRating?.average_rating?.toFixed(2)}
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center'>
                                        <div className="fs-3">{t("rating")}
                                        </div>
                                        <div className='fs-4 fw-bold'>
                                            {totalData}
                                        </div>
                                    </div>
                                </div>
                                {/* <div className='col-md-4 col-5 border-end'>
                            </div> */}

                                <div className='col-md-8 col-6 starRatingContainer w-100'>

                                    <div className='d-flex justify-content-start align-items-center gap-4'>
                                        {t("5")}
                                        <div className='d-flex gap-1'>
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                        </div>
                                        <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.five_star_rating))} className='ratingBar' />
                                        <div>
                                            {productRating?.five_star_rating}
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                                        {t("4")}
                                        <div className='d-flex gap-1'>
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                        </div>
                                        <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.four_star_rating))} className='ratingBar' />
                                        <div>
                                            {productRating?.four_star_rating}
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                                        {t("3")}
                                        <div className='d-flex gap-1'>
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                        </div>
                                        <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.three_star_rating))} className='ratingBar' />
                                        <div>{productRating?.three_star_rating}</div>
                                    </div>
                                    <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                                        {t("2")}
                                        <div className='d-flex gap-1'>
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                        </div>
                                        <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.two_star_rating))} className='ratingBar' />
                                        <div>{productRating?.two_star_rating}</div>
                                    </div>
                                    <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                                        {t("1")}
                                        <div className='d-flex gap-1'>
                                            <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                            <img src={StarUnfilledSVG} alt='starLogo' loading='lazy' />
                                        </div>
                                        <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.one_star_rating))} className='ratingBar' />
                                        <div>{productRating?.one_star_rating}</div>
                                    </div>

                                </div>

                            </div>
                        </div>


                        <div className='col-md-7 px-4 py-5  '>
                            {productRating?.rating_list?.slice(0, limit)?.map((review) => (
                                <>
                                    <div className='reviewList mb-5' key={review.id}>
                                        <div className='d-flex justify-content-start align-items-center gap-3 review-container-name'>
                                            <div className='fw-bold'>
                                                {review?.user?.name}
                                            </div>
                                            <div className='reviewRatingButton d-flex flex-row align-items-start gap-2'>
                                                {Array.from({ length: review?.rate })?.map((_, index) => (
                                                    <div key={index} className='text-light'>
                                                        <img src={StarFilledSVG} alt='starFilledLogo' loading='lazy' />
                                                    </div>
                                                ))}
                                                {Array.from({ length: 5 - review?.rate })?.map((_, index) => (
                                                    <div key={index} className='text-light'>
                                                        <img src={StarUnfilledSVG} alt='starFilledLogo' loading='lazy' />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='review-container-review'>{review.review}</div>
                                        <div className='d-flex justify-content-start flex-row gap-3 pe-5 mb-3'>
                                            {review?.images?.slice(0, imageMappingLength)?.map((image, index) => (
                                                <div className={index === (imageMappingLength - 1) ? "overlayParent" : ""} key={image?.id}>
                                                    <img src={image?.image_url} alt='userImage' className='userReviewImages' />
                                                    {(index === (imageMappingLength - 1)) ?
                                                        <div div className='overlay'>
                                                            +{(parseInt(review?.images?.length) - imageMappingLength)}
                                                        </div>
                                                        :
                                                        null}
                                                </div>

                                            ))}
                                        </div>
                                        <div className='review-container-date'>
                                            {formatDate(review?.updated_at)}, {formatTime(review?.updated_at)}
                                        </div>
                                    </div>
                                </>
                            ))}
                            <Pagination
                                activePage={currPage}
                                itemsCountPerPage={limit}
                                totalItemsCount={totalData}
                                pageRangeDisplayed={5}
                                onChange={handlePageChange.bind(this)}
                            />
                        </div>
                    </>
                }
                {((productRating?.rating_list?.length === 0) && !Loading) ?
                    <div className='d-flex justify-content-center align-items-center noRatingContainer'>
                        <div className="col-md-12">
                            <div className="d-flex flex-row  gap-5 productContainer">
                                <img src={product?.image_url} alt="productLogo" className="productLogo" />
                                <div className="d-flex flex-column align-items-start">
                                    <div className="productName">
                                        {product?.name}
                                    </div>
                                    <div className="productPrice">
                                        {setting.setting && setting.setting.currency} {product?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center"><img src={NoRatingsFound} alt="noRatingsFoundImg" /></div>
                        </div>
                    </div> : null}
            </div>
        </>


    );
};

export default AllRatingsAndReviews;