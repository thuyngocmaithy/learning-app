import React, { useEffect, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachThongBao.module.scss';
import { List, Skeleton, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ProjectIcon />
                </span>
                <h3 className={cx('title')}>Danh sách thông báo</h3>
            </div>
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
                        <Skeleton avatar title={false} loading={isLoading} active>
                            <List.Item.Meta
                                avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                title={<div className={cx('name')}>{item.scientificResearchGroupName}</div>}
                                description={
                                    <div>
                                        <div
                                            className={cx('container-deadline-register')}
                                            style={{ display: screenWidth < 768 ? 'flex' : 'none', margin: "7px 0" }}
                                        >
                                            <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                            <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                                        </div>
                                        <p>Ngành: {item.faculty.facultyName}</p>
                                        <p style={{ margin: "7px 0" }}>
                                            Trạng thái:
                                            <Tag color={item.status.color} className={cx('tag-status')}>
                                                {item.status.statusName}
                                            </Tag>
                                        </p>
                                    </div>
                                }
                            />
                            <div
                                className={cx('container-deadline-register')}
                                style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                            >
                                <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                            </div>
                        </Skeleton>
                    </List.Item>
                )}
            />
        </div>
    );
}

export default DanhSachThongBao;
