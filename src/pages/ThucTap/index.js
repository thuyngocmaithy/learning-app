import classNames from 'classnames/bind';
import styles from './ThucTap.module.scss';
import { Checkbox, Col, List, Row, Skeleton, Tabs, Tag } from 'antd';
import { ScheduleActiveIcon, FilterIcon, LocationIcon, SalaryIcon } from '../../components/Icons';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Filter from '../../components/Popper/Filter';

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
    {
        id: '6',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        area: 'Hồ Chí Minh',
        salary: '1tr ~ 2tr VNĐ',
        countReceived: '0',
        countSubmitted: '155',
        date: '01/01/2025',
        khoa: 'Công nghệ thông tin',
    },
];

function ThucTap() {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    useEffect(() => {
        setList(listProject);
        setIsLoading(false);
    }, []);

    const openInNewTab = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const optionsMajor = [
        {
            label: 'Công nghệ thông tin',
            value: 'cntt',
        },
    ];
    const optionsArea = [
        {
            label: 'hcm',
            value: 'Hồ Chí Minh',
        },
    ];

    const ITEM_TABS_FILTERS = [
        {
            id: 1,
            title: 'Ngành học',
            children: <Checkbox.Group options={optionsMajor} defaultValue={['Pear']} />,
        },
        {
            id: 2,
            title: 'Khu vực',
            children: <Checkbox.Group options={optionsArea} defaultValue={['Pear']} />,
        },
    ];

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách công việc',
            children: (
                <>
                    <div className={cx('container-filter')}>
                        <Filter filterValue={ITEM_TABS_FILTERS}>
                            <div>
                                <Button
                                    className={cx('filterBtn')}
                                    leftIcon={<FilterIcon className={cx('icon', 'filter-icon')} />}
                                    outline
                                    small
                                >
                                    Bộ lọc
                                </Button>
                            </div>
                        </Filter>
                    </div>

                    <List
                        pagination={{
                            position: 'bottom',
                            align: 'end',
                        }}
                        dataSource={list}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <Button
                                        outline
                                        verysmall
                                        onClick={() => openInNewTab(`/TienDoHocTap/ThucTap/${index}`)}
                                    >
                                        Xem chi tiết
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
                                            // <div>
                                            //     <div>
                                            //         <span className={cx('area')}>
                                            //             <LocationIcon />
                                            //             {item.area}
                                            //         </span>
                                            //         <span className={cx('salary')}>{item.salary}</span>
                                            //     </div>
                                            //     <div>
                                            //         <span>Số hồ sơ đã nhận việc: {item.countReceived}</span>
                                            //         <span className={cx('countSubmitted')}>
                                            //             Số hồ sơ đã ứng tuyển: {item.countSubmitted}
                                            //         </span>
                                            //     </div>
                                            // </div>
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
                </>
            ),
        },
        {
            id: 2,
            title: 'Công việc đã ứng tuyển',
            children: (
                <>
                    <div className={cx('container-filter')}>
                        <Filter filterValue={ITEM_TABS_FILTERS}>
                            <div>
                                <Button
                                    className={cx('filterBtn')}
                                    leftIcon={<FilterIcon className={cx('icon', 'filter-icon')} />}
                                    outline
                                    small
                                >
                                    Bộ lọc
                                </Button>
                            </div>
                        </Filter>
                    </div>

                    <List
                        pagination={{
                            position: 'bottom',
                            align: 'end',
                        }}
                        dataSource={list}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    index === 1 || index === 4 ? (
                                        <Tag color="default">Chờ xác nhận</Tag>
                                    ) : (
                                        <Tag color="green">Tiếp nhận hồ sơ</Tag>
                                    ),

                                    <Button primary verysmall>
                                        Xem chi tiết
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
                                        <p style={{ marginRight: '10px' }}>Ngày ứng tuyển: </p>
                                        <p>{item.date}</p>
                                    </div>
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ScheduleActiveIcon />
                </span>
                <h3 className={cx('title')}>Thực tập tốt nghiệp</h3>
            </div>
            <Tabs
                defaultActiveKey={1} //nếu có dự án tham gia => set defaultActiveKey = 2
                centered
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />
        </div>
    );
}

export default ThucTap;
