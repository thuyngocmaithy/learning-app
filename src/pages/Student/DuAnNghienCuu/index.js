import classNames from 'classnames/bind';
import styles from './DuAnNghienCuu.module.scss';
import { Card, List, Skeleton, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import Button from '../../../components/Core/Button';
import config from '../../../config';

import { getAllProject } from '../../../services/projectService';


const cx = classNames.bind(styles);

const listProject = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', count: 4, deadline: '10/05/2024' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        count: 1,
        deadline: '15/07/2024',
        instructors: 'Nguyễn Thanh Sang'
    },
    {
        id: '3',
        name: 'Ứng dụng công nghệ Blockchain trong kiểm chứng hồ sơ xin việc',
        count: 2,
        deadline: '12/06/2024',
        instructors: 'Nguyễn Thanh Sang'

    },
    {
        id: '4',
        name: 'Khảo sát một số thuật toán metaheuristic giải bài toán cây steiner nhỏ nhất trong trường hợp đồ thị thưa',
        count: 0,
        deadline: '03/05/2024',
        instructors: 'Nguyễn Thanh Sang'

    },
    {
        id: '5',
        name: 'Mô hình phát hiện tắc nghẽn với các tham số động trên mạng cảm biến không dây',
        count: 10,
        deadline: '09/09/2024',
        instructors: 'Nguyễn Thanh Sang'

    },
    {
        id: '6',
        name: 'Dự đoán ung thư phổi trên ảnh CT bằng phương pháp học sâu',
        count: 5,
        deadline: '30/12/2024',
        instructors: 'Nguyễn Thanh Sang'

    },
];
const listProjectJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];

function DuAnNghienCuu() {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getAllProject();
                const projects = response.data.map(project => ({
                    id: project.projectId,
                    name: project.projectName,
                    count: project.numberOfRegister,
                    deadline: new Date(project.finishDate).toLocaleDateString('vi-VN'),
                    instructors: project.instructor.fullname,
                }));
                setList(projects);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách dự án',
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
                                    description={'Lượt đăng ký: ' + item.count + ' Giáo viên hướng dẫn : ' + item.instructors}

                                />
                                <p></p>

                                <div className={cx('container-deadline-register')}>
                                    <p style={{ marginRight: '10px' }}>Hạn chót đăng ký: </p>
                                    <p>{item.deadline}</p>
                                </div>
                            </Skeleton>
                        </List.Item>
                    )}
                />
            ),
        },
        {
            id: 2,
            title: 'Dự án tham gia',
            children: (
                <div>
                    {listProjectJoin.map((item, index) => {
                        let color = item.status === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-duanthamgia')}
                                key={index}
                                type="inner"
                                title={item.name}
                                extra={
                                    <Button primary verysmall to={config.routes.DuAnThamGia}>
                                        Chi tiết
                                    </Button>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.status}
                                </Tag>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ResearchProjectsIcon />
                </span>

                <h3 className={cx('title')}>Dự án nghiên cứu khoa học</h3>
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

export default DuAnNghienCuu;
