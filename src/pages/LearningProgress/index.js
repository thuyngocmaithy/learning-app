import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import CardProgress from '../../components/CardProgress';
import images from '../../assets/images';

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
            <CardProgress data-aos="fade-left" title="Sắp xếp môn học dự kiến" image={images.timeTable} />
            <CardProgress data-aos="fade-left" title="Kế hoạch thực tập tốt nghiệp" image={images.intern} imageLeft />
            <CardProgress data-aos="fade-left" title="Dự án khóa luận tốt nghiệp" image={images.thesis} />
        </div>
    );
}

export default LearningProgress;
