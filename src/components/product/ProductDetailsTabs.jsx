import { useEffect, useState } from 'react';
import { ConfigProvider, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import Loader from '../loader/Loader';
import "./product-rating.css";
import { ProgressBar } from 'react-bootstrap';
import StarFilledSVG from "../../utils/StarFilled.svg";
import StarUnfilledSVG from "../../utils/StarUnfilled.svg";
import { formatDate, formatTime } from '../../utils/formatDate';
import { Link, useParams } from 'react-router-dom';
import NoRatingFoundSVG from "../../utils/No_Review_Found.svg";

const ProductDetailsTabs = ({ productdata, productRating, totalData, loading }) => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [activeKey, setActiveKey] = useState("1");
    const [imageMappingLength, setImageMappingLength] = useState(5);
    const handleOnChange = (key) => {
        setActiveKey(key);
    };

    const calculatePercentage = (totalRating, starWiseRating) => {
        const percentage = (starWiseRating * 100) / totalRating;
        return percentage;
    };
    useEffect(() => {
        const adjustImageLengthAccWindowSize = () => {
            if (window.innerWidth <= 425) {
                setImageMappingLength(2);
            } else if (window.innerWidth > 425 && window.innerWidth <= 485) {
                setImageMappingLength(3);
            } else if (window.innerWidth > 485 && window.innerWidth <= 760) {
                setImageMappingLength(4);
            }
            else if (window.innerWidth > 760 && window.innerWidth <= 992) {
                setImageMappingLength(3);
            }
            else if (window.innerWidth > 930 && window.innerWidth <= 1200) {
                setImageMappingLength(5);
            }
            else if (window.innerWidth > 1200) {
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

    const items = [{
        key: "1",
        label: <h3 className={activeKey == "1" ? "productTabActive" : "description-header"}>{t("product_desc_title")}</h3>,
        children:

            <div className='description' dangerouslySetInnerHTML={{ __html: productdata.description }} />

    },
    {

        key: "2",
        label: <h3 className={activeKey == "2" ? "productTabActive  " : "description-header"}>{t("rating_and_reviews")}</h3>,
        children: <div id='ratings-section' className={`${productRating?.rating_list?.length != 0 ? "row justify-content-center" : ""} `}>
            {loading &&
                <>
                    <Loader width={"100%"} height={"500px"} />
                </>

            }
            {((productRating?.rating_list?.length !== 0) && !loading) &&
                <>

                    <div className='col-md-5 mb-5 pe-4'>

                        <h5 className='title'>{t("rating_and_reviews")}</h5>

                        <div className='row justify-content-between ratingContainer'>

                            <div className='d-flex flex-row justify-content-start align-items-center ratingCircleContainer'>
                                <div className='ratingCircle'>
                                    {productRating?.average_rating}
                                </div>
                                <div className='d-flex flex-column justify-content-center align-items-center'>
                                    <div>{t("rating")}
                                    </div>
                                    <div className='fw-bold'>
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


                    <div className='col-md-7 px-4 customerReviewsContainer'>
                        <h5 className='title'>{t("customer_reviews")}</h5>
                        {productRating?.rating_list.slice(0, 3).map((review) => (
                            <>
                                <div className='reviewList mb-5' key={review.id}>
                                    <div className='d-flex justify-content-start align-items-center gap-3 review-container-name'>
                                        <div className='fw-bold'>
                                            {review.user.name}
                                        </div>
                                        <div className='reviewRatingButton d-flex flex-row align-items-start gap-2'>
                                            {Array.from({ length: review.rate })?.map((_, index) => (
                                                <div key={index} className='text-light'>
                                                    <img src={StarFilledSVG} alt='starFilledLogo' loading='lazy' />
                                                </div>
                                            ))}
                                            {Array.from({ length: 5 - review.rate })?.map((_, index) => (
                                                <div key={index} className='text-light'>
                                                    <img src={StarUnfilledSVG} alt='starFilledLogo' loading='lazy' />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='review-container-review'>{review.review}</div>
                                    <div className='d-flex justify-content-start flex-row gap-3 pe-5 mb-3'>
                                        {review?.images?.slice(0, imageMappingLength)?.map((image, index) => (
                                            <div className={index === (imageMappingLength - 1) ? "overlayParent" : ""} key={image.id}>
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
                                        {formatDate(review.updated_at)}, {formatTime(review.updated_at)}
                                    </div>
                                </div>
                            </>
                        ))}
                        <div className='d-flex justfiy-content-center'>
                            <Link style={{ textDecoration: "none", color: "#121418" }} className='viewAllReviewsLink' to={`/product/${slug}/rating-and-reviews`}>{t("view_all_reviews")}
                            </Link>
                        </div>
                    </div>
                </>
            }
            {((productRating?.rating_list?.length === 0) && !loading) ?
                <div className='d-flex flex-column justify-content-center align-items-center noRatingContainer'>
                    <div>
                        <img src={NoRatingFoundSVG} alt='noRatingFound' />
                    </div>
                    <div className='noRatingFoundText'>
                        {t("no_ratings_available_yet")}</div>
                </div> : null}
        </div>
    }];

    return (
        <div className='description-wrapper'>
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            inkBarColor: "none",
                            itemSelectedColor: "black !important"
                        },
                    },
                }}
            >
                <Tabs items={items} activeKey={activeKey} onChange={handleOnChange} />
            </ConfigProvider>
        </div>
    );
};

export default ProductDetailsTabs;;;;;