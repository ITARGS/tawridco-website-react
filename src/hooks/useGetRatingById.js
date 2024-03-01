import { useEffect, useState } from 'react';
import api from '../api/api';

const useGetRatingById = (token, id) => {
    const [rating, setRating] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchRating = async () => {
            setLoading(true);
            try {
                const response = await api.getProductRatingById(token, id);
                console.log("fetchRating Called");
                const result = await response.json();
                setRating(result.data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);

        };
        fetchRating();
    }, [id]);
    return { rating, error, loading };
};

export default useGetRatingById;