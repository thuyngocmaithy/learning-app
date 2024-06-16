import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import CardTienDoHocTap from '../../components/CardTienDoHocTap';
import images from '../../assets/images';
import config from '../../config';

function TienDoHocTap() {
    window.addEventListener('load', () => {
        Aos.init({
            duration: 1000,
            offset: 100,
        });
    });
    useEffect(() => {
        Aos.init({ duration: 1500 });
    }, []);
    return (
        <div>
            <CardTienDoHocTap
                data-aos="fade-left"
                title="Theo dõi tiến độ học phần"
                image={images.timeTable}
                contentButton="Theo dõi"
                to={config.routes.TienDoHocPhan}
            />
            <CardTienDoHocTap
                data-aos="fade-left"
                title="Kế hoạch thực tập tốt nghiệp"
                image={images.intern}
                contentButton="Sắp xếp"
                imageLeft
                to={config.routes.ThucTap}
            />
            <CardTienDoHocTap
                data-aos="fade-left"
                title="Dự án khóa luận tốt nghiệp"
                image={images.thesis}
                contentButton="Sắp xếp"
                to={config.routes.KhoaLuan}
            />
        </div>
    );
}

export default TienDoHocTap;
