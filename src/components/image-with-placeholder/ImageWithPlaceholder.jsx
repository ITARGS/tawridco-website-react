import React, { useState } from 'react';
import ImagePlaceholder from "../../utils/image-placeholder/image.png";

const ImageWithPlaceholder = ({ src, alt, className, handleOnClick }) => {
    const [imageSrc, setImageSrc] = useState(ImagePlaceholder);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
        setImageSrc(src);
    };

    const handleError = () => {
        setImageSrc(ImagePlaceholder);
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