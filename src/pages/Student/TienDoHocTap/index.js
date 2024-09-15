import CardTienDoHocTap from '../../../../components/CardTienDoHocTap';
import timetable from '../../../assets/images/timetable.png';
import intern from '../../../assets/images/intern.png';
import thesis from '../../../assets/images/thesis.png';
import chuandaura from '../../../assets/images/chuandaura.png';
import config from '../../../config';

function TienDoHocTap() {
    return (
        <div>
            <CardTienDoHocTap
                title="Theo dõi tiến độ học phần"
                image={timetable}
                contentButton="Theo dõi"
                to={config.routes.TienDoHocPhan}
            />
            <CardTienDoHocTap
                title="Kế hoạch thực tập tốt nghiệp"
                image={intern}
                contentButton="Sắp xếp"
                imageLeft
                to={config.routes.ThucTap}
            />
            <CardTienDoHocTap
                title="đề tài khóa luận tốt nghiệp"
                image={thesis}
                contentButton="Sắp xếp"
                to={config.routes.KhoaLuan}
            />
            <CardTienDoHocTap
                title="Kế hoạch nộp chuẩn đầu ra"
                image={chuandaura}
                contentButton="Sắp xếp"
                imageLeft
                to={config.routes.KhoaLuan}
            />
        </div>
    );
}

export default TienDoHocTap;
