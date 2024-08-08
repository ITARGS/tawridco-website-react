import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { setFilterBrands, clearAllFilter } from '../../model/reducer/productFilterReducer';
import "./brand.css";
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Brand = () => {
  const shop = useSelector(state => state.shop);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setting = useSelector(state => (state.setting));
  const { t } = useTranslation();

  const handleFilter = (id) => {
    dispatch(clearAllFilter())
    dispatch(setFilterBrands({ data: id }));
    navigate('/products');
  }

  return (
    <>
      {(shop.shop?.is_brand_section_in_homepage && (shop?.shop?.brands?.length > 0)) ? (
        <section id="all-brands">
          <div className="row brand_section_header">
            <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
              <div className="title d-md-flex align-items-center ">
                <p>{t('shop_by')} {t('brands')}</p>
                <Link className='d-none d-md-block' to='/brands'>{t('see_all')} {t('brands')}<AiOutlineArrowRight size={15} className='see_brand_arrow' /> </Link>
              </div>
              <div className=' d-md-none'>
                <Link className='brand_button' to='/brands'>{t('see_all')}</Link>
              </div>
              {(shop?.shop?.brands?.length > 5) ? (
                <div className="justify-content-end align-items-ceneter d-md-flex d-none">
                  <button className='prev-arrow-brand'><FaChevronLeft size={20} /></button>
                  <button className='next-arrow-brand'><FaChevronRight size={20} /></button>
                </div>
              ) : null}
            </div>
          </div>
          <div className='row justify-content-center home allBrandsSlider'>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: '.prev-arrow-brand',
                nextEl: '.next-arrow-brand',
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                1200: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                300: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
              }}
            >
              {shop.shop?.brands?.map((ctg, index) => (
                <SwiperSlide key={index}>
                  <div className="my-3 content" onClick={() => handleFilter(ctg.id.toString())}>
                    <div className='card'>
                      <ImageWithPlaceholder className='card-img-top' src={ctg.image_url} alt='brandImage' />
                      <div className='card-body' style={{ cursor: "pointer" }} >
                        <p>{ctg.name}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default Brand;