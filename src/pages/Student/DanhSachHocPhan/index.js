import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import {
    saveRegisterSubjects
} from '../../../services/userService';
import { message, Spin } from 'antd';
import { findKhungCTDTByUserId } from '../../../services/studyFrameService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);
function DanhSachHocPhan() {
    const { userId } = useContext(AccountLoginContext);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [frameId, setFrameId] = useState();
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Danh sách các học phần</h3>
                </div>
                <Button primary small onClick={handleSave}>
                    Lưu
                </Button>
            </div>

            <Table
                frameId={frameId}
                registeredSubjects={registeredSubjects}
                setRegisteredSubjects={setRegisteredSubjects}
            />
        </div>
    );
}

export default DanhSachHocPhan;