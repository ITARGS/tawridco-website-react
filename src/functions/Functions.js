import store from "../model/store";
import api from "../api/api";
import { setCart } from "../model/reducer/cartReducer";
import { setFavourite } from "../model/reducer/favouriteReducer";

export const AddToCart = async (product_id, product_variant_id, qty, setisLoader, cookies, toast, city, props) => {
    setisLoader(true);
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
                            props?.setShowModal(false);
                            store.dispatch(setCart({ data: res }));
                        }
                    });

            }
            else {
                toast.error(result.message);

            }
            setisLoader(false);
        });
};


export const RemoveFromCart = async (product_id, product_variant_id, cookies, toast, city) => {
    await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
        .then(response => response.json())
        .then(async (result) => {
            if (result.status === 1) {
                toast.success(result.message);
                await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                    .then(resp => resp.json())
                    .then(res => {
                        if (res.status === 1)
                            store.dispatch(setCart({ data: res }));
                        else
                            store.dispatch(setCart({ data: null }));
                    });

            }
            else {
                toast.error(result.message);
            }
        });
};


export const AddToFavorite = async (product_id, setisLoader, cookies, toast, city) => {
    // setisLoader(true);
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
                            store.dispatch(setFavourite({ data: res }));
                    });
            }
            else {
                // setisLoader(false);
                toast.error(result.message);
            }
        });
};

export const RemoveFromFavorite = async (product_id, cookies, toast, city) => {
    await api.removeFromFavorite(cookies.get('jwt_token'), product_id)
        .then(response => response.json())
        .then(async (result) => {
            if (result.status === 1) {
                toast.success(result.message);
                await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                    .then(resp => resp.json())
                    .then(res => {
                        if (res.status === 1)
                            store.dispatch(setFavourite({ data: res }));
                        else
                            store.dispatch(setFavourite({ data: null }));
                    });
            }
            else {
                toast.error(result.message);
            }
        });
};