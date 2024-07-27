import classNames from 'classnames/bind';
import styles from './ThongTinThucTap.module.scss';
import background_detail_internship from '../../../assets/images/background-DetailInternship.png';
import { Col, Divider, List, Row, Skeleton, Tag } from 'antd';
import Button from '../../../components/Core/Button';
import { LocationIcon, SalaryIcon } from '../../../assets/icons';
import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

const listProject = [
    {
        id: '1',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
    {
        id: '3',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
    {
        id: '4',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
    {
        id: '5',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
];

const dataInfoLeft = [
    { title: 'Ngày đăng:', description: '11/06/2024' },
    { title: 'Địa điểm:', description: 'Thành phố Hồ Chí Minh' },
    { title: 'Số lượng:', description: '0/4' },
];
const dataInfoRight = [
    { title: 'Loại:', description: 'Thực tập' },
    { title: 'Lương:', description: 'Lương thỏa thuận' },
    { title: 'Hết hạn:', description: '21/06/2024' },
];
function ThongTinThucTap() {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    useEffect(() => {
        setList(listProject);
        setIsLoading(false);
    }, []);

    const openInNewTab = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={cx('wrapper-thontinthuctap')}>
            <div className={cx('container-header')}>
                <img className={cx('background')} src={background_detail_internship} alt="" />
                <h2>FLUTTER INTERN</h2>
                <div className={cx('container-header-info')}>
                    <div>
                        <List
                            itemLayout="horizontal"
                            dataSource={dataInfoLeft}
                            renderItem={(item, index) => (
                                <List.Item style={{ color: 'aliceblue' }}>
                                    <List.Item.Meta
                                        avatar={<h4>{item.title}</h4>}
                                        title={
                                            <p className={cx('container-header-info-description')}>
                                                {item.description}
                                            </p>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                    <div>
                        <List
                            itemLayout="horizontal"
                            dataSource={dataInfoRight}
                            renderItem={(item, index) => (
                                <List.Item style={{ color: 'aliceblue' }}>
                                    <List.Item.Meta
                                        avatar={<h4>{item.title}</h4>}
                                        title={
                                            <p className={cx('container-header-info-description')}>
                                                {item.description}
                                            </p>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
                <Button primary large className={cx('btnSubmit')}>
                    Nộp hồ sơ
                </Button>
            </div>
            <div className={cx('container-body')}>
                <div className={cx('container-chitietcongviec')}>
                    <h2>Chi tiết công việc</h2>
                    <Divider orientation="left">Mô tả công việc</Divider>
                    <p>Ban Quản lý Công viên lịch sử - Văn hóa Dân tộc tuyển TTS, cụ thể:</p>
                    <p>- Công nghệ thông tin (2 - ưu tiên Nam) </p>
                    <p>- Việt Nam học (2)</p>
                    <Divider orientation="left">Ngành học liên quan</Divider>
                    <Tag color="green">Văn hóa du lịch</Tag>
                    <Tag color="green">Công nghệ thông tin</Tag>
                    <Divider orientation="left">Yêu cầu ứng viên</Divider>
                    <p>
                        Sinh viên có nhu cầu liên hệ phòng Hợp tác Doanh nghiệp và Hỗ trợ Sinh viên nhận file đăng ký
                        thực tập, điền đầy đủ thông tin nội dung trên file và gửi về phòng Hợp tác Doanh nghiệp và HTSV
                        (phòng HB 308)
                    </p>
                    <Divider orientation="left">Quyền lợi</Divider>
                    <p>- Hồ sơ sinh viên sẽ được xem xét và được phỏng vấn trực tiếp với đơn vị tuyển dụng thực tập.</p>
                    <p>- Mọi quyền lợi sẽ được trao đổi trực tiếp với nhà tuyển dụng.</p>
                    <Divider orientation="left">Địa điểm làm việc</Divider>
                    <p>Công viên Lịch sử - Văn hóa Dân tộc: Khu phố Vĩnh Thuận, phường Long Bình, Tp. Thủ Đức.</p>
                </div>
                <div className={cx('container-vieclamtuongtu')}>
                    <h2 className={cx('title-vieclamtuongtu')}>Việc làm tương tự</h2>
                    <List
                        dataSource={list}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <Button
                                        outline
                                        verysmall
                                        onClick={() => openInNewTab(`/TienDoHocTap/ThucTap/${index}`)}
                                    >
                                        Chi tiết
                                    </Button>,
                                    <Button primary verysmall>
                                        Đăng ký
                                    </Button>,
                                ]}
                            >
                                <Skeleton avatar title={false} loading={isLoading} active>
                                    <List.Item.Meta
                                        avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                        title={<div className={cx('name')}>{item.name}</div>}
                                        description={
                                            <div>
                                                <Row gutter={[16, 16]}>
                                                    <Col span={6}>
                                                        <LocationIcon className={cx('description-icon')} />
                                                        {item.area}
                                                    </Col>
                                                    <Col span={6}>
                                                        <SalaryIcon className={cx('description-icon')} />
                                                        {item.salary}
                                                    </Col>
                                                </Row>
                                                <Row gutter={[16, 16]}>
                                                    <Col span={6}>Số hồ sơ đã nhận việc: {item.countReceived}</Col>
                                                    <Col span={6}>Số hồ sơ đã ứng tuyển: {item.countSubmitted}</Col>
                                                </Row>
                                            </div>
                                        }
                                    />
                                    <div className={cx('container-count-register')}>
                                        <p style={{ marginRight: '10px' }}>Ngày đăng: </p>
                                        <p>{item.date}</p>
                                    </div>
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export default ThongTinThucTap;
