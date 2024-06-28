import React, { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/api';
import { toast } from 'react-toastify';
import '../login/login.css';
import './newmodal.css';
import { useTranslation } from 'react-i18next';
import { setCurrentUser } from "../../model/reducer/authReducer";
import { addtoGuestCart, setIsGuest } from '../../model/reducer/cartReducer';






function NewUserModal() {
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user);
    const setting = useSelector((state) => state.setting);
    const cart = useSelector((state) => state.cart);

    const [username, setusername] = useState();
    const [useremail, setuseremail] = useState();
    const [isLoading, setisLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const closeModalRef = useRef();

    const handleUpdateUser = (e) => {
        e.preventDefault();

        setisLoading(true);
        if (user?.jwtToken !== "") {
            api.edit_profile(username, useremail, selectedFile, user?.jwtToken)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        getCurrentUser(user?.jwtToken);
                        if (cart?.isGuest === true && cart?.guestCart?.length !== 0) {
                            dispatch(setIsGuest({ data: false }));
                            AddtoCartBulk(user?.jwtToken);
                        }
                        setuseremail();
                        setusername();
                        // closeModalRef.current.click()
                    }
                    else {
                        setError(result.message);
                        setisLoading(false);
                    }
                });
        }

    };

    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                toast.success(t("guest_products_added_to_cart"));
                dispatch(addtoGuestCart({ data: [] }));
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };

    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (!result.user.status) {
                    setisLoading(false);
                    dispatch(setCurrentUser({ data: result.user }));
                    // dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                } else {

                    if (result.status === 1) {
                        // dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                        dispatch(setCurrentUser({ data: result.user }));
                        if (closeModalRef.current && result.user.status) {
                            closeModalRef.current.click();
                        }
                        toast.success(t("profile_updated_successfully"));
                        setisLoading(false);
                    }
                }
            });
    };
    const { t } = useTranslation();
    return (
        <>

            <Modal
                show={user.user && user.user.status == 2}
                backdrop="static"
                keyboard={true}
                className='user_data_modal'>


                <Modal.Header className='web_logo'>

                    <img src={setting.setting && setting.setting.web_settings.web_logo} alt="" />

                </Modal.Header>
                <Modal.Body
                    className='user_data_modal_body'>
                    <span className='note'>{t("profile_note")}</span>
                    <form onSubmit={handleUpdateUser} className='userData-Form'>
                        <div className='inputs-container'>
                            <input type='text' placeholder={t('user_name')} value={username} onChange={(e) => {
                                setError("");
                                setusername(e.target.value);
                            }} required />
                            <input type='email' placeholder={t('email_address')} value={useremail} onChange={(e) => {
                                setError("");
                                setuseremail(e.target.value);
                            }} required />
                            <input type='tel' placeholder={t('mobile_number')} value={user.user && user.user.mobile} readOnly style={{ color: "var(--sub-text-color)" }} />
                        </div>
                        <button whiletap={{ scale: 0.8 }} type='submit' disabled={isLoading} >{t("update")} {t("profile")}</button>
                    </form>
                    {error ? <p className='user_data_form_error'>{error}</p> : ""}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default NewUserModal;
