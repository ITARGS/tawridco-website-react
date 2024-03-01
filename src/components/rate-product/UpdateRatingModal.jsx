import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'universal-cookie';
import useGetRatingById from '../../hooks/useGetRatingById';
import { Modal } from 'react-bootstrap';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { LuStar } from 'react-icons/lu';
import UploadPhoto from "../../utils/UploadPhoto.svg";
import { toast } from "react-toastify";
import "./rateproduct.css";
import api from '../../api/api';

const UpdateRatingModal = (props) => {
  const cookies = new Cookies();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(null);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const { rating, error, loading } = useGetRatingById(cookies.get("jwt_token"), props.ratingId);
  console.log(rating);

  useMemo(() => {
    setReview(rating?.review);
    setActiveIndex(rating?.rate);
    setFiles(rating?.images);
  }, [rating]);

  const handleActive = (index) => {
    setActiveIndex(index == activeIndex ? null : index);
  };
  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };
  const handleFileDelete = (imageId) => {
    const updatedFiles = files.filter((file) => file.id !== imageId);
    // console.log(imageId);
    setDeletedImageIds((prevIds) => [...prevIds, imageId]);
    setFiles(updatedFiles);
  };
  const handleFileUpload = (e) => {
    const newFileArray = Array.from(e.target.files);
    const allowedFiles = ["image/png", "image/jpg", "image/jpeg"];
    const validFiles = newFileArray.filter((file) => allowedFiles.includes(file.type));
    if (newFiles?.length > 0) {
      setNewFiles([...files, ...validFiles]);
    } else {
      setNewFiles([...validFiles]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(deletedImageIds);
    try {
      const response = await api.updateProductRating(cookies.get("jwt_token"), props?.ratingId, activeIndex, review, newFiles, deletedImageIds?.join(","));
      const result = await response.json();
      props.setShowModal(false);
      if (result.message == "The image.0 must be an image.") {
        toast.error(t("only_images_are_allowed"));
      } else {
        toast.success(result.message);
      }
      setActiveIndex(null);
      setReview("");
      setNewFiles([]);
    } catch (err) {
      toast.error(err.message);

    }
  };
  return (
    <Modal
      size="md"
      centered
      className="rateProductModal"
      show={props.showModal}
      backdrop={"static"}
    >
      <Modal.Header className="d-flex justify-content-between">
        <div className="d-flex justify-content-between align-items-center">
          <div className="modalHeading">
            {t("rate_the_product")}
          </div>
        </div>

        <div>
          <button type="button"
            onClick={() => {
              props.setShowModal(false);

            }}>
            <AiOutlineCloseCircle size={30} className="crossLogo" />
          </button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) => handleSubmit(e)} className="rateForm">
          <div className="d-flex justify-content-center align-items-center flex-column">
            <div className="container mb-5">
              <p className="modalSubHeading">{t("overall_rating")} :</p>
              <div className="d-flex justify-content-around gap-5">
                <div className="starBackground">
                  <LuStar className={`star ${activeIndex >= 1 ? "active " : ""}`} onClick={() => handleActive(1)} />
                </div>
                <div className="starBackground">
                  <LuStar className={`star ${activeIndex >= 2 ? "active " : ""}`} onClick={() => handleActive(2)} />

                </div>
                <div className="starBackground">
                  <LuStar className={`star ${activeIndex >= 3 ? "active " : ""}`} onClick={() => handleActive(3)} />
                </div>
                <div className="starBackground">
                  <LuStar className={`star ${activeIndex >= 4 ? "active " : ""}`} onClick={() => handleActive(4)} />
                </div>
                <div className="starBackground">
                  <LuStar className={`star ${activeIndex >= 5 ? "active " : ""}`} onClick={() => handleActive(5)} />
                </div>
              </div>
            </div>
            <div className="container mt-3">
              <p className="modalSubHeading">{t("product_review")} :</p>
              <div className="">
                <textarea
                  name="productReview"
                  className="reviewTextArea"
                  value={review}
                  rows={5}
                  placeholder={t("write_review_here")}
                  onChange={handleReviewChange}
                />
              </div>
            </div>
            <div className="container mt-3">
              <p className="modalSubHeading">{t("add_photos")}:</p>
              <div className="d-flex flex-row flex-wrap justify-content-start">
                {console.log(files)}
                {files?.map((image) => (
                  <div div key={image?.id} className="uploadedImagesContainer">
                    <img className="uploadedImages" src={image?.image_url} alt="uploadedImage" loading="lazy" />
                    <div className="deleteUploaded d-flex justify-content-center align-items-center"
                      onClick={() => handleFileDelete(image?.id)}
                    >x</div>
                  </div>
                ))}
              </div>
              <label htmlFor="fileInput" className="modalSubHeading">
                <div className="uploadContainer">
                  <img src={UploadPhoto} alt="uploadImage" className="placeHolderImage" />
                  <input
                    type="file"
                    accept=".jpg, .png, .jpeg"
                    id="fileInput"
                    className="file-input"
                    multiple
                    onChange={handleFileUpload}
                    aria-placeholder="Upload" />
                </div>
              </label>
            </div>
            <hr />
            <div className="d-flex justify-content-end w-100 mt-3">
              <button type="submit" className="submitRating">
                {t("submit_review")}
              </button>

            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateRatingModal;