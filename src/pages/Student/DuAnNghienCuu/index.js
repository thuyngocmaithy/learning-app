import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './DuAnNghienCuu.module.scss';
import { Card, List, message, Skeleton, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getAllProject } from '../../../services/projectService';
import { getProjectUserByUserId, deleteProjectUserByUserIdAndProjectId, getProjectUserByProjectId } from '../../../services/projectUserService';
import DuAnDetail from '../../../components/FormDetail/DuAnDetail';
import DuAnRegister from '../../../components/FormRegister/DuAnRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { showDeleteConfirm } from '../../../components/Core/Delete';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getUserById } from '../../../services/userService';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function DuAnNghienCuu() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listProjectRegister, setListProjectRegister] = useState([]);
    const projectCancelRef = useRef(null);
    const { deleteNotification } = useSocketNotification();

    // Xử lý active tab từ url
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = queryParams.get('tabIndex');
    const [activeTab, setActiveTab] = useState(parseInt(tabIndexFromUrl) || 1);

    useEffect(() => {
        if (tabIndexFromUrl) {
            setActiveTab(parseInt(tabIndexFromUrl));
        }
    }, [tabIndexFromUrl]);

    const fetchProjects = async () => {
        try {
            const response = await getAllProject();

            let projects = response.data.map(project => ({
                projectId: project.projectId,
                projectName: project.projectName,
                executionTime: project.executionTime,
                instructorName: project.instructor.fullname,
                level: project.level,
                budget: project.budget,
                description: project.description,
                createUser: project.createUser,
                instructor: project.instructor,
                lastModifyUser: project.lastModifyUser
            }));
            const promises = projects.map(async (project) => {
                const responseCountRegister = await getProjectUserByProjectId({ project: project.projectId });
                const count = responseCountRegister.data.data.length;

                return { ...project, count };
            });

            // Đợi tất cả các Promise hoàn thành
            const updatedList = await Promise.all(promises);

            // Cập nhật list một lần
            setList(updatedList);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setIsLoading(false);
        }
    };

    const checkRegisterProject = async () => {
        try {
            const response = await getProjectUserByUserId({ user: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredProjects = response.data.data.map(data => data.project.projectId);
            setListProjectRegister(response.data.data);



        } catch (error) {
            console.error('Error fetching registered projects:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        checkRegisterProject();
    }, [showModalRegister]);

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
                                <Button outline verysmall onClick={() => setShowModalDetail(item)}>
                                    Chi tiết
                                </Button>,
                                listProjectRegister.some(projectRegister => projectRegister.project.projectId === item.projectId) ?
                                    <Button className={cx('btn-cancel')} outline verysmall onClick={() => {
                                        projectCancelRef.current = item;
                                        setTimeout(() => showDeleteConfirm('dự án nghiên cứu', handleCancelWithConfirm, true), 0);

                                    }} >
                                        Hủy đăng ký
                                    </Button> :
                                    <Button primary verysmall onClick={() => setShowModalRegister(item)}>
                                        Đăng ký
                                    </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                {console.log(item)
                                }
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.projectName}</div>}
                                    description={<div>
                                        <p>Lượt đăng ký: {item.count} </p>
                                        <p>Giảng viên hướng dẫn: {item.instructorName}</p>
                                    </div>}
                                />
                                <p></p>
                                <div className={cx('container-deadline-register')}>
                                    <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                    <p>{item.executionTime}</p>
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
                    {listProjectRegister.map((item, index) => {
                        let color = item.isApprove ? 'green' : 'red';
                        return (
                            <Card
                                className={cx('card-duanthamgia')}
                                key={index}
                                type="inner"
                                title={item.project.projectName}
                                extra={
                                    <Button primary verysmall
                                        onClick={() => {
                                            if (!item.isApprove) {
                                                setShowModalDetail(item.project);
                                            }
                                        }}
                                        to={item.isApprove ? `${config.routes.DuAnThamGia}?project=${item.id}` : null}>
                                        Chi tiết
                                    </Button>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.isApprove ? 'Đã duyệt' : 'Chờ duyệt'}
                                </Tag>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];

    const handleCancelNotification = async () => {
        const projectCancel = projectCancelRef.current;
        try {
            const user = await getUserById(userId)
            const ListNotification = [
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia dự án ${projectCancel.name}`,
                    toUser: projectCancel.createUser,
                    createUser: user.data,
                },
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia dự án ${projectCancel.name}`,
                    toUser: projectCancel.instructor,
                    createUser: user.data,
                }
            ];

            if (projectCancel.lastModifyUser &&
                projectCancel.lastModifyUser.id !== projectCancel.createUser.id &&
                projectCancel.lastModifyUser.id !== projectCancel.instructor.id) {
                ListNotification.push({
                    content: `Sinh viên ${userId} đăng ký tham gia dự án ${projectCancel.name}`,
                    toUser: projectCancel.lastModifyUser,
                    createUser: user.data,
                });
            }

            ListNotification.map(async (item) => {
                await deleteNotification(item.toUser, item);
            })

        } catch (err) {
            console.error(err)
        }
    };


    // Hàm xử lý hủy đăng ký dự án với xác nhận
    const handleCancelWithConfirm = async () => {
        if (projectCancelRef.current) {
            console.log(projectCancelRef.current)
            try {
                const responseCancel = await deleteProjectUserByUserIdAndProjectId({ project: projectCancelRef.current.projectId, user: userId });
                if (responseCancel) {
                    message.success('Hủy đăng ký thành công');
                    // Cập nhật danh sách dự án đã đăng ký
                    await checkRegisterProject();
                    await fetchProjects(); // Cập nhật danh sách dự án

                    //xóa thông báo
                    handleCancelNotification();
                }


            } catch (error) {
                message.error('Hủy đăng ký thất bại');
            } finally {
                projectCancelRef.current = null // Reset projectCancel sau khi xử lý
            }
        } else {
            message.error('Dự án không hợp lệ');
        }
    };

    const duAnDetailMemoized = useMemo(() => (
        <DuAnDetail
            title={'dự án nghiên cứu'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const duAnRegisterMemoized = useMemo(() => (
        <DuAnRegister
            title={
                <>
                    <p>Đăng ký dự án nghiên cứu</p>
                    <p className={cx("title-model-register")}>{showModalRegister.projectName}</p>
                </>
            }
            showModal={showModalRegister}
            setShowModal={setShowModalRegister}
        />
    ), [showModalRegister]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ResearchProjectsIcon />
                </span>

                <h3 className={cx('title')}>Dự án nghiên cứu khoa học</h3>
            </div>
            <Tabs
                defaultActiveKey={activeTab}
                centered
                items={ITEM_TABS.map((item, index) => ({
                    label: item.title,
                    key: index + 1,
                    children: item.children,
                }))}
            />
            {duAnDetailMemoized}
            {duAnRegisterMemoized}
        </div>
    );
}

export default DuAnNghienCuu;
