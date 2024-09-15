import classNames from 'classnames/bind';
import styles from './ThongTinDeTaiNCKHThamGia.module.scss';
import { Descriptions, Spin, Tag } from 'antd';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getscientificResearchUserById } from '../../services/scientificResearchUserService';

const cx = classNames.bind(styles);

function ThongTinDeTaiNCKHThamGia({ scientificResearch, thesis = false }) {



    const DISCRIPTION_ITEMS = [
        {
            key: '1-info',
            label: 'Khoa',
            children: scientificResearch ? scientificResearch.scientificResearch.faculty.facultyName : '',
        },
        {
            key: '2-info',
            label: 'Thời gian thực hiện',
            children: scientificResearch ? scientificResearch.scientificResearch.executionTime : '',
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
            children: scientificResearch ? scientificResearch.scientificResearch.instructor.fullname : '',
        },
        {
            key: '6-info',
            label: 'Sinh viên thực hiện',
            children: scientificResearch ? scientificResearch.user.fullname : '',
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
                                <h2>{scientificResearch.scientificResearch.scientificResearchName}</h2>
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
                    {scientificResearch.scientificResearch.description}
                </div>
            </div>
        </div>
    );
}

export default ThongTinDeTaiNCKHThamGia;
