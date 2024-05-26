import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import CardLearningProgress from '../../components/CardLearningProgress';
import images from '../../assets/images';
import config from '../../config';

function LearningProgress() {
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
            <CardLearningProgress
                data-aos="fade-left"
                title="Theo dõi tiến độ học tập"
                image={images.timeTable}
                contentButton="Theo dõi"
                to={config.routes.TrackProgress}
            />
            <CardLearningProgress
                data-aos="fade-left"
                title="Kế hoạch thực tập tốt nghiệp"
                image={images.intern}
                contentButton="Sắp xếp"
                imageLeft
            />
            <CardLearningProgress
                data-aos="fade-left"
                title="Dự án khóa luận tốt nghiệp"
                image={images.thesis}
                contentButton="Sắp xếp"
                to={config.routes.Thesis}
            />
        </div>
    );
}

export default LearningProgress;
