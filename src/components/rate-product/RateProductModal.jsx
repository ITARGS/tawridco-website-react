import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
import { AiOutlineCloseCircle } from "react-icons/ai";
import VeryDissatisfied from "../../utils/rate-svgs/sentiment_very_dissatisfied.svg";
import Dissatisfied from "../../utils/rate-svgs/sentiment_dissatisfied.svg";
import Neutral from "../../utils/rate-svgs/sentiment_neutral.svg";
import Satisfied from "../../utils/rate-svgs/sentiment_satisfied.svg";
import VerySatisfied from "../../utils/rate-svgs/sentiment_very_satisfied.svg";
import "./rateproduct.css";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useSelector } from "react-redux";

const RateProductModal = React.memo((props) => {

    const user = useSelector(state => state.user.user);
    const cookies = new Cookies();
    const { t } = useTranslation();

    const [activeIndex, setActiveIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [files, setFiles] = useState([]);
    const [review, setReview] = useState("");

    const handleActive = (index) => {
        setActiveIndex(index == activeIndex ? null : index);
    };
    const handleHover = (index) => {
        setHoverIndex(index);
    };
    const handleFileUpload = (e) => {
        console.log(e.target.files);
        console.log(Object.values(e.target.files));
        setFiles(Object.values(e.target.files));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.addProductRating(cookies.get("jwt_token"), props.product_id, activeIndex, review, files);
            const result = await response.json();
            props.setShowPdtRatingModal(false);
            if (result.message == "The image.0 must be an image.") {
                toast.error(t("only_images_are_allowed"));
            } else {
                toast.success(result.message);
            }
            setActiveIndex(null);
            setHoverIndex(null);
            setReview("");
            setFiles([]);
        } catch (err) {
            toast.error(err.message);

        }
    };
    const handleReviewChange = (e) => {
        setReview(e.target.value);
    };

    return (
        <Modal
            size="lg"
            centered
            show={props.showPdtRatingModal}
            backdrop={"static"}
        >
            <Modal.Header className="d-flex justify-content-between">
                <div className="d-flex justify-content-between align-items-center">

                    <div>
                        {t("rate_the_product")}
                    </div>
                </div>

                <div>
                    <button type="button" onClick={() => props.setShowPdtRatingModal(false)}>
                        <AiOutlineCloseCircle size={30} className="crossLogo" />
                    </button>
                </div>
            </Modal.Header>
            <Modal.Body >
                <form onSubmit={(e) => handleSubmit(e)} className="rateForm">
                    <div className="d-flex justify-content-center align-items-center flex-column">
                        <div className="container">
                            <p>{t("rate")} :</p>
                            <div className="d-flex justify-content-around">
                                <img className={`emoji ${activeIndex >= 1 ? "active " : ""} ${hoverIndex >= 1 ? "hover" : ""}`}
                                    src={VeryDissatisfied}
                                    alt="very_dissatisfied"
                                    onClick={() => handleActive(1)}
                                    onMouseEnter={() => handleHover(1)}
                                    onMouseLeave={() => handleHover(null)}
                                />
                                <img className={`emoji ${activeIndex >= 2 ? "active " : ""} ${hoverIndex >= 2 ? "hover" : ""}`}
                                    src={Dissatisfied}
                                    alt="dissatisfied"
                                    onClick={() => handleActive(2)}
                                    onMouseEnter={() => handleHover(2)}
                                    onMouseLeave={() => handleHover(null)}
                                />
                                <img className={`emoji ${activeIndex >= 3 ? "active " : ""} ${hoverIndex >= 3 ? "hover" : ""}`}
                                    src={Neutral}
                                    alt="neutral"
                                    onClick={() => handleActive(3)}
                                    onMouseEnter={() => handleHover(3)}
                                    onMouseLeave={() => handleHover(null)}
                                />
                                <img className={`emoji ${activeIndex >= 4 ? "active " : ""} ${hoverIndex >= 4 ? "hover" : ""}`}
                                    src={Satisfied}
                                    alt="satisfied"
                                    onClick={() => handleActive(4)}
                                    onMouseEnter={() => handleHover(4)}
                                    onMouseLeave={() => handleHover(null)}
                                />
                                <img className={`emoji ${activeIndex >= 5 ? "active " : ""} ${hoverIndex >= 5 ? "hover" : ""}`}
                                    src={VerySatisfied}
                                    alt="very_satisfied"
                                    onClick={() => handleActive(5)}
                                    onMouseEnter={() => handleHover(5)}
                                    onMouseLeave={() => handleHover(null)}
                                />
                            </div>
                        </div>
                        <div className="container mt-3">
                            <p>{t("write_a_review")} :</p>
                            <div className="">
                                <textarea
                                    name="productReview"
                                    className="reviewTextArea"
                                    rows={5}
                                    placeholder={t("share_your_review_here")}
                                    onChange={handleReviewChange}
                                />
                            </div>
                        </div>
                        <div className="container mt-3">
                            <label htmlFor="fileInput">{t("attachments")}:</label>
                            <input
                                type="file"
                                accept=".jpg, .png, .jpeg"
                                id="fileInput"
                                multiple
                                onChange={handleFileUpload}
                                aria-placeholder="Upload" />
                        </div>
                        <div className="mt-3">
                            <button type="submit" className="submitRating">
                                {t("submit")}
                            </button>

                        </div>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
});

export default RateProductModal;



