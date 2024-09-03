import classNames from 'classnames/bind';
import styles from './ThongTinDuAnThamGia.module.scss';
import { Descriptions, Spin, Tag } from 'antd';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProjectUserById } from '../../services/projectUserService';

const cx = classNames.bind(styles);

function ThongTinDuAnThamGia({ project, thesis = false }) {



    const DISCRIPTION_ITEMS = [
        {
            key: '1-info',
            label: 'Khoa',
            children: project ? project.project.faculty.facultyName : '',
        },
        {
            key: '2-info',
            label: 'Thời gian thực hiện',
            children: project ? project.project.executionTime : '',
        },
        {
            key: '3-info',
            label: 'Thời điểm bắt đầu',
            children: '10/03/2024 08:00:00',
        },
        {
            key: '4-info',
            label: 'Hạn hoàn thành',
            children: '10/09/2024 17:00:00',
        },
        {
            key: '5-info',
            label: 'Giảng viên hướng dẫn',
            children: project ? project.project.instructor.fullname : '',
        },
        {
            key: '6-info',
            label: 'Sinh viên thực hiện',
            children: project ? project.user.fullname : '',
        },
    ];

    return (
        <div className={cx('wrapper-info-detail')}>
            <div className={cx('container-info')}>
                <div className={cx('container-info-detail')}>
                    <Descriptions
                        title={
                            <div className={cx('container-title')}>
                                <h2>Đề tài:</h2>
                                <h2>{project.project.projectName}</h2>
                                <Tag color="green">Xác định vấn đề cần nghiên cứu</Tag>
                            </div>
                        }
                        items={DISCRIPTION_ITEMS}
                    />
                </div>
            </div>
            <div className={cx('container-description')}>
                <h4>Thông tin mô tả</h4>
                <div>
                    {project.project.description}
                </div>
            </div>
        </div>
    );
}

export default ThongTinDuAnThamGia;
