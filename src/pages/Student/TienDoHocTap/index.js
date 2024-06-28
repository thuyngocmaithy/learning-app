import CardTienDoHocTap from '../../../components/CardTienDoHocTap';
import images from '../../../assets/images';
import config from '../../../config';

function TienDoHocTap() {
    return (
        <div>
            <CardTienDoHocTap
                title="Theo dõi tiến độ học phần"
                image={images.timeTable}
                contentButton="Theo dõi"
                to={config.routes.TienDoHocPhan}
            />
            <CardTienDoHocTap
                title="Kế hoạch thực tập tốt nghiệp"
                image={images.intern}
                contentButton="Sắp xếp"
                imageLeft
                to={config.routes.ThucTap}
            />
            <CardTienDoHocTap
                title="Dự án khóa luận tốt nghiệp"
                image={images.thesis}
                contentButton="Sắp xếp"
                to={config.routes.KhoaLuan}
            />
            <CardTienDoHocTap
                title="Kế hoạch nộp chuẩn đầu ra"
                image={images.chuandaura}
                contentButton="Sắp xếp"
                imageLeft
                to={config.routes.KhoaLuan}
            />
        </div>
    );
}

export default TienDoHocTap;
