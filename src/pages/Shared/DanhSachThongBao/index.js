import React, { useEffect, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachThongBao.module.scss';
import { List, Skeleton } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getByUserId } from '../../../services/notificationService';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function DanhSachThongBao() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }
        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchDataNoti = async () => {
            try {
                const res = await getByUserId(userId);
                if (res.status === 200) {
                    setList(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy thông báo: " + error);
            }
            finally {
                setIsLoading(false);
            }
        }
        if (userId)
            fetchDataNoti();
    }, [userId])

    return (

        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ProjectIcon />
                </span>
                <h3 className={cx('title')}>Danh sách thông báo</h3>
            </div>
            <Skeleton avatar title={false} loading={isLoading} active>
                <List
                    pagination={{
                        position: 'bottom',
                        align: 'end',
                        onChange: (page) => setCurrentPage(page), // Lưu số trang hiện tại
                        pageSize: pageSize, // Số mục trong một trang
                    }}
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    primary
                                    verysmall
                                >
                                    Danh sách
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                title={<div className={cx('name')}>{item.title}</div>}
                                description={
                                    <div>
                                        <p>Nội dung: {item.content}</p>
                                        <p>Người tạo: {item.createUser.userId} - {item.createUser.fullname}</p>
                                    </div>
                                }
                            />
                            <div
                                className={cx('container-deadline-register')}
                                style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                            >
                                <p style={{ marginRight: '10px' }}>Ngày tạo: {item.createDate && dayjs(item.createDate).format('DD/MM/YYYY HH:mm:ss')}</p>
                            </div>

                        </List.Item>
                    )}
                />
            </Skeleton>
        </div>
    );
}

export default DanhSachThongBao;
