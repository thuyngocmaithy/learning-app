import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import {
    saveRegisterSubjects
} from '../../../services/userService';
import { Descriptions, message, Radio, Spin, Switch } from 'antd';
import { findKhungCTDTByUserId } from '../../../services/studyFrameService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);
function DanhSachHocPhan() {
    const { userId } = useContext(AccountLoginContext);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [frameId, setFrameId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [valueStatus, setValueSatus] = useState('Tất cả');

    useEffect(() => {
        const fetchKhungCTDT = async () => {
            try {
                const res = await findKhungCTDTByUserId(userId);
                if (res.status === 200) {
                    setFrameId(res.data.data.frameId);
                }
            } catch (error) {
                console.error(error);
            }
            finally {
                setIsLoading(false);
            }

        }
        fetchKhungCTDT();
    }, [userId])

    const handleSave = async () => {
        const result = Object.keys(registeredSubjects).map(key => ({
            user: userId,
            subject: key,
            semester: registeredSubjects[key].semesterId
        }));
        try {
            const response = await saveRegisterSubjects(result);
            if (response.status === 201) {
                message.success('Lưu dữ liệu thành công');
            }
            else {
                message.error('Lưu dữ liệu thất bại');
            }
        } catch (error) {
            console.error(error);
        }
    };
    if (isLoading) {
        return (
            <div className={cx('container-loading')}>
                <Spin size="large" />
            </div>
        );
    }

    const items = [
        {
            key: '1',
            label: <span className={cx('color-tag', 'subject-correct')}></span>,
            children: 'Đúng tiến độ sắp xếp',
        },
        {
            key: '2',
            label: <span className={cx('color-tag', 'subject-error')}></span>,
            children: 'Trễ tiến độ sắp xếp',
        },
        {
            key: '3',
            label: <span className={cx('color-tag', 'subject-open')}></span>,
            children: 'Môn học được sắp xếp mở',
        },
    ];

    const options = [
        {
            label: 'Chưa học',
            value: 'Chưa học',
        },
        {
            label: 'Đã học',
            value: 'Đã học',
        },
        {
            label: 'Tất cả',
            value: 'Tất cả',
        }
    ]

    const handleChange = (e) => {
        setValueSatus(e.target.value); // Cập nhật giá trị khi chọn
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Danh sách các học phần</h3>
                </div>
                <div className={cx('toolbar')}>
                    <Radio.Group block options={options} defaultValue="Tất cả" optionType="button" onChange={handleChange} />
                    <Button className={cx('btnSave')} primary small onClick={handleSave}>
                        Lưu
                    </Button>
                </div>
            </div>
            <Descriptions items={items} className={cx('description')} />
            <Table
                frameId={frameId}
                registeredSubjects={registeredSubjects}
                setRegisteredSubjects={setRegisteredSubjects}
                status={valueStatus}
            />
        </div >
    );
}

export default DanhSachHocPhan;