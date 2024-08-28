import classNames from 'classnames/bind';
import styles from './ThucTap.module.scss';
import { Checkbox, Col, List, Row, Skeleton, Tabs, Tag } from 'antd';
import { ScheduleActiveIcon, FilterIcon, LocationIcon, SalaryIcon } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import Button from '../../../components/Core/Button';
import Filter from '../../../components/Popper/Filter';

import { getAllIntern } from '../../../services/internService';

const cx = classNames.bind(styles);


function ThucTap() {
    const [listIntern, setListIntern] = useState([]); // State cho danh sách thực tập
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const response = await getAllIntern(); // Gọi API
                const interns = response.data.map((intern) => ({
                    id: intern.id,
                    name: intern.title,
                    area: intern.location,
                    salary: `${intern.salary} USD`, // format lại lương nếu cần
                    countReceived: '0', // Bạn có thể điều chỉnh giá trị này tùy theo nhu cầu
                    countSubmitted: intern.internNumber,
                    date: new Date(intern.createDate).toLocaleDateString('vi-VN'), // format lại ngày tháng
                }));
                setListIntern(interns);
                setIsLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu thực tập:', error);
            }
        };

        fetchInterns();
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
                        dataSource={listIntern}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <Button outline verysmall onClick={() => openInNewTab(`/ThucTap/${index}`)}>
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
                        dataSource={listIntern}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    index === 1 || index === 4 ? (
                                        <Tag color="default">Chờ xác nhận</Tag>
                                    ) : (
                                        <Tag color="green">Tiếp nhận hồ sơ</Tag>
                                    ),

                                    <Button primary verysmall>
                                        Chi tiết
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
