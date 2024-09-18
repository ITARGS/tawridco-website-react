import React, { useEffect, useState } from 'react';
import ImagePlaceholder from "../../utils/image-placeholder/image.png";
import { useSelector } from 'react-redux';


const ImageWithPlaceholder = ({ src, alt, className, handleOnClick }) => {
    const setting = useSelector(state => state.setting)
    const [imageSrc, setImageSrc] = useState(ImagePlaceholder);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (setting.setting.web_settings?.placeholder_image == undefined) {
            setImageSrc(ImagePlaceholder)

        } else {

            setImageSrc(setting.setting.web_settings?.placeholder_image);
        }
    }, [])


    // console.log("src", src)
    const handleLoad = () => {
        setIsLoaded(true);
        setImageSrc(src);
    };

    const handleError = () => {
        if (setting.setting.web_settings?.placeholder_image == undefined) {
            setImageSrc(ImagePlaceholder)

        } else {

            setImageSrc(setting.setting.web_settings?.placeholder_image);
        }

    };

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onLoad={handleLoad}
            onError={handleError}
            onClick={handleOnClick}
            loading='lazy'
        />
    );
};

export default ImageWithPlaceholder;