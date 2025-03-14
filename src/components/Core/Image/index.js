import PropTypes from 'prop-types';
import { useState, forwardRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import noImage from '../../../assets/images/no-image.png';
import styles from './Image.module.scss';

const Image = forwardRef(({ src, alt, className, fallback: customFallback = noImage, ...props }, ref) => {
    //Nhận tất cả props ở bên ngoài

    const [fallback, setFallback] = useState('');

    useEffect(() => {
        setFallback('');
    }, [src]);

    const handleError = () => {
        setFallback(customFallback);
    };

    return (
        <img
            ref={ref}
            className={classNames(styles.wrapper, className)}
            // Mặc định sẽ có className wrapper
            // className có khi truyền từ bên ngoài vào
            src={fallback || src}
            alt={alt}
            {...props}
            onError={handleError}
        />
    ); ///truyền tất cả props vào
    // fallback || src
    // Nếu có fallback (lỗi)=> dùng fallback; còn không sẽ dùng src
});

Image.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    fallback: PropTypes.string,
};

export default Image;
