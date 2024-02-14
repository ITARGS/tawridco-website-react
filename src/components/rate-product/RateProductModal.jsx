import { useState } from "react"
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap"
import { AiOutlineCloseCircle } from "react-icons/ai"
import VeryDissatisfied from "../../utils/rate-svgs/sentiment_very_dissatisfied.svg"
import Dissatisfied from "../../utils/rate-svgs/sentiment_dissatisfied.svg"
import Neutral from "../../utils/rate-svgs/sentiment_neutral.svg"
import Satisfied from "../../utils/rate-svgs/sentiment_satisfied.svg"
import VerySatisfied from "../../utils/rate-svgs/sentiment_very_satisfied.svg"
import "./rateproduct.css"


const RateProductModal = (props) => {

    const [activeIndex, setActiveIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const handleActive = (index) => {
        setActiveIndex(index == activeIndex ? null : index);
    }
    const handleHover = (index) => {
        setHoverIndex(index);
    }
    const handleFileUpload = () => {

    }
    const { t } = useTranslation();
    return (
        <Modal
            size="lg"
            centered
            show={true}
            backdrop={"static"}

        >
            <Modal.Header className="d-flex justify-content-between">
                <div className="d-flex justify-content-between align-items-center">

                    <div>
                        Rate the product
                    </div>
                </div>

                <div>
                    <button>
                        <AiOutlineCloseCircle size={30} />
                    </button>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center align-items-center flex-column">
                    <div className="container">
                        <p>Rate :</p>
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
                    <div className="container">
                        <p>Write a review :</p>
                        <div className="">
                            <textarea className="reviewTextArea" rows={5} placeholder="Share Your Review Here" />
                        </div>
                    </div>
                    <div className="container">
                        <p>Attachment:</p>
                        <div className="">
                            <input type="file" accept=".jpg, .png" onChange={handleFileUpload} placeholder="Upload" />
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default RateProductModal