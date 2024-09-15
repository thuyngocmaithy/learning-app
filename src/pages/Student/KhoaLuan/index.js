import classNames from 'classnames/bind';
import styles from './KhoaLuan.module.scss';
import { List, Skeleton, Tabs } from 'antd';
import { ScheduleActiveIcon } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import Button from '../../../components/Core/Button';
import { useNavigate } from 'react-router-dom';

import { getAllThesis } from '../../../services/thesisService';
const cx = classNames.bind(styles);


function KhoaLuan() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    useEffect(() => {
        const fetchThesis = async () => {
            try {
                const response = await getAllThesis();
                const thesis = response.data.map(thesis => ({
                    id: thesis.id,
                    name: thesis.title,
                    supervisor: thesis.supervisor.fullname,
                    khoa: thesis.faculty.facultyName,
                }));
                setList(thesis);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching scientificResearchs:', error);
                setIsLoading(false);
            }
        };

        fetchThesis();
    }, []);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <List
                    pagination={{
                        position: 'bottom',
                        align: 'end',
                    }}
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button outline verysmall>
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
                                    description={'Khoa: ' + item.khoa}
                                />
                                <div className={cx('container-count-register')}>
                                    <p style={{ marginRight: '10px' }}>Giảng viên hướng dẫn: </p>
                                    <p>{item.supervisor}</p>
                                </div>
                            </Skeleton>
                        </List.Item>
                    )}
                />
            ),
        },
        {
            id: 2,
            title: 'Đề tài của bạn',
        },
    ];

    //Khi chọn tab 2 (Đề tài của bạn) => Điều hướng đến KhoaLuanThamGia
    const handleTabClick = (index) => {
        if (index === 2) {
            navigate('/KhoaLuan/KhoaLuanThamGia');
        }
    };
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ScheduleActiveIcon />
                </span>

                <h3 className={cx('title')}>Khóa luận tốt nghiệp</h3>
            </div>
            <Tabs
                defaultActiveKey={1} //nếu có đề tài tham gia => set defaultActiveKey = 2
                centered
                onTabClick={(index) => handleTabClick(index)}
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

export default KhoaLuan;
