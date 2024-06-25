import React, { useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';
import api from '../../api/api';
import Skeleton from 'react-loading-skeleton';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';


const CategoryComponent = ({ data, selectedCategories,
    setSelectedCategories }) => {
    const dispatch = useDispatch();
    const [expandedCategories, setExpandedCategories] = useState([]);
    // const [selectedCategories, setSelectedCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [isLoader, setIsLoader] = useState(false);
    // const toggleCategory = (categoryId) => {
    //     if (expandedCategories.includes(categoryId)) {
    //         setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    //     } else {
    //         setExpandedCategories([...expandedCategories, categoryId]);
    //     }
    // };
    const fetchSubcategories = (categoryId) => {
        // API call to fetch subcategories for the given category id
        setIsLoader(true);
        api.getCategory(categoryId)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setSubcategories(prevState => ({
                        ...prevState,
                        [categoryId]: result.data
                    }));
                }
                setIsLoader(false);
            })
            .catch(error => {
                setIsLoader(false);
                console.log("error ", error);
            });
    };
    const toggleCategory = (categoryId) => {
        if (expandedCategories.includes(categoryId)) {
            setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
        } else {
            setExpandedCategories([...expandedCategories, categoryId]);
            if (!subcategories[categoryId] && categoryHasChild(categoryId)) {
                setSubcategories(prevState => ({
                    ...prevState,
                    [categoryId]: { loading: true }
                }));
                fetchSubcategories(categoryId);
            }
        }
    };

    const categoryHasChild = (categoryId) => {
        // Implement logic to check if the category has child categories
        // You can retrieve this information from your data structure or API response
        const category = data.find(category => category.id === categoryId);
        return category && category.has_child;
    };

    const handleSelectedCategories = (ctgId) => {
        if (selectedCategories.includes(ctgId)) {
            const updatedCategories = selectedCategories?.filter((id) => id != ctgId);
            setSelectedCategories(updatedCategories);
            dispatch(setFilterCategory({ data: updatedCategories.join(",") }));
        } else {
            const updatedCategories = selectedCategories?.filter((cat) => {
                if (cat != "") {
                    return cat;
                }
            });
            updatedCategories.push(ctgId);
            setSelectedCategories(updatedCategories);
            dispatch(setFilterCategory({ data: updatedCategories.join(",") }));
        }
    };

    const renderSubcategories = (subcategories) => {
        return subcategories?.map(subcategory => (
            <div key={subcategory.id} className='d-flex flex-column ms-3'>
                <div className={`d-flex justify-content-between align-items-center filter-bar border-bottom  p-2 ${selectedCategories?.includes(subcategory?.id) ? "active" : ""}`}>
                    <div className='d-flex gap-3 align-items-baseline'
                        onClick={() => {
                            // Handle selection of the category
                            handleSelectedCategories(subcategory.id);
                        }}>
                        <div className='image-container'>
                            {/* <img src={subcategory.image_url} alt="category" /> */}
                            <ImageWithPlaceholder src={subcategory.image_url} alt="subCategoryImage" />
                        </div>
                        <p>{subcategory.name}</p>
                    </div>
                    {subcategory.has_child && (
                        <div>
                            {subcategory.has_active_child ? (
                                <>
                                    {expandedCategories.includes(subcategory.id) ?
                                        <IoIosArrowUp
                                            size={20}
                                            onClick={() => toggleCategory(subcategory.id)}
                                        /> :
                                        <IoIosArrowDown
                                            size={20}
                                            onClick={() => toggleCategory(subcategory.id)}
                                        />
                                    }
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
                {expandedCategories.includes(subcategory.id) && subcategory.has_active_child && (
                    <div className="subcategories">
                        {subcategory.loading ? (
                            <Skeleton className='w-100' height={35} />
                        ) : (
                            renderSubcategories(subcategory.cat_active_childs)
                        )}
                    </div>
                )}
            </div>
        ));
    };


    return (
        <>
            {data?.map(category => (
                <div key={category?.id} className='p-0'>
                    <div key={category?.id}
                        className={`d-flex justify-content-between align-items-center filter-bar p-2 border-bottom ${expandedCategories.includes(category.id) ? 'expanded' : ''}
                            ${selectedCategories?.includes(category?.id) ? "active" : ""}
                        `}>
                        <div className='d-flex gap-3 align-items-baseline' onClick={() => {
                            handleSelectedCategories(category.id);
                        }}>
                            <div className='image-container'>
                                {/* <img src={category.image_url} alt="category" /> */}
                                <ImageWithPlaceholder src={category.image_url} alt="categoryImage" />
                            </div>
                            <p>{category.name}</p>
                        </div>
                        {category.has_child && (
                            <div
                                className='toggle-arrow'
                                onClick={() => {
                                    const isExpanded = expandedCategories.includes(category.id);
                                    if (isExpanded) {
                                        const updatedExpandedCategories = expandedCategories.filter(id => id !== category.id);
                                        setExpandedCategories(updatedExpandedCategories);
                                    } else {
                                        toggleCategory(category.id);
                                    }
                                }}>
                                {expandedCategories.includes(category.id)
                                    ? <IoIosArrowUp size={20} />
                                    : <IoIosArrowDown size={20} />
                                }
                            </div>
                        )}
                    </div>
                    {expandedCategories.includes(category.id) && category.has_child && (
                        <div className='subcategories'>
                            {renderSubcategories(category.cat_active_childs)}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

export default CategoryComponent;
