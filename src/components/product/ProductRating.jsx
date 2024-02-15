import { useEffect, useState } from 'react';
import api from '../../api/api';
import Cookies from 'universal-cookie';
import Loader from '../loader/Loader';
import VeryDissatisfied from "../../utils/rate-svgs/sentiment_very_dissatisfied.svg";
import Dissatisfied from "../../utils/rate-svgs/sentiment_dissatisfied.svg";
import Neutral from "../../utils/rate-svgs/sentiment_neutral.svg";
import Satisfied from "../../utils/rate-svgs/sentiment_satisfied.svg";
import VerySatisfied from "../../utils/rate-svgs/sentiment_very_satisfied.svg";

const ProductRating = ({ product_id }) => {
    const cookies = new Cookies();
    const [ratings, setRatings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRatingAvailable, setIsRatingAvailable] = useState(false);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        setIsLoading(true);
        const response = await api.getProductRatings(cookies.get("jwt_token"), product_id, 20, 0);
        const result = await response.json();
        // console.log(result);
        setIsRatingAvailable(result.data.rating_list.length != 0 ? true : false);
        setRatings(result.data.rating_list);
        setIsLoading(false);
    };

    console.log(ratings, isRatingAvailable);


    return (

        <div className='d-flex flex-column justfiy-content-center align-items-center w-100'>
            {isLoading &&
                <>
                    <Loader />
                </>

            }
            {(!isRatingAvailable && !isLoading) &&
                <>
                    No Ratings Available
                </>
            }
            {
                <div>
                    <div className="d-flex flex-column justify-content-between">
                        <div>
                            <img
                                src={VerySatisfied}
                                alt="very_satisfied"
                            />
                        </div>
                        <div>
                            <img
                                src={Satisfied}
                                alt="satisfied"
                            />
                        </div>
                        <div>
                            <img
                                src={Neutral}
                                alt="neutral"
                            />
                        </div>
                        <div>
                            <img
                                src={Dissatisfied}
                                alt="dissatisfied"
                            />
                        </div>
                        <div>
                            <img
                                src={VeryDissatisfied}
                                alt="very_dissatisfied"
                            />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default ProductRating;;;;