import classNames from 'classnames/bind';
import styles from './InfoDetailProject.module.scss';
import { Descriptions, Tag } from 'antd';

const cx = classNames.bind(styles);

function InfoDetailProject({ item, thesis = false }) {
    return (
        <div className={cx('wrapper-info-detail')}>
            <div className={cx('container-info')}>
                <div className={cx('container-info-detail')}>
                    <Descriptions
                        title={
                            <div className={cx('container-title')}>
                                <h2>Đề tài:</h2>
                                <h2> Ứng dụng công nghệ Blockchain trong bài toán vé điện tử</h2>
                                <Tag color="green">Xác định vấn đề cần nghiên cứu</Tag>
                            </div>
                        }
                        items={item}
                    />
                </div>
            </div>
            <div className={cx('container-description')}>
                <h4>Thông tin mô tả</h4>
                <div>
                    1. Về ngôn ngữ chính: sử dụng tiếng Anh trong các bài báo cáo khoa học, báo cáo tổng kết đề tài,
                    poster và phần thuyết trình đề tài trong hội nghị “Khoa học và Công nghệ sinh viên OISP”, dự kiến tổ
                    chức vào tháng 07 năm 2020. 2. Về số lượng thành viên: Ưu tiên cho các SV Chương trình Đào tạo Quốc
                    tế đự kiến làm LVTN trong học kỳ 2, năm học 2019 — 2020. 3. Về yêu cầu thực hiện đề tài: kết quả sản
                    phẩm đề tài NCKH bao gồm: e_ Báo cáo tông kết kết quả thực hiện đề tài: 01 quyền; e_ Tham gia báo
                    cáo đề tài NCKH tại hội nghị “Khoa học và Công nghệ sinh viên OISP” do VP ĐTQT tổ chức. 4. Về quy
                    trình đăng ký, xét chọn, ký hợp đồng, nghiệm thu và thanh lý đề tài: tuân theo quy trình của Quy chế
                    hoạt động Khoa học và Công nghệ trường ĐH Bách Khoa TP.HCM
                </div>
            </div>
        </div>
    );
}

export default InfoDetailProject;
