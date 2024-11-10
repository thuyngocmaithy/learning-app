import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import {
    registerSubject,
    deleteUserRegisteredSubject,
    getUserRegisteredSubjects,
    getUseridFromLocalStorage
} from '../../../services/userService';
import { message } from 'antd';

const cx = classNames.bind(styles);

function DanhSachHocPhan() {
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [tableKey, setTableKey] = useState(0); // Add a key to force table reload

    const handleSelectionChange = useCallback((newSelection) => {
        setSelectedSubjects(newSelection);
    }, []);

    const resetTable = useCallback(() => {
        setTableKey(prevKey => prevKey + 1); // Increment key to force remount
        setSelectedSubjects({}); // Clear selections
    }, []);

    const handleSave = async () => {
        const userId = getUseridFromLocalStorage();

        const registrationPromises = Object.entries(selectedSubjects).map(async ([subjectId, { semesterIndex }]) => {
            const year = Math.floor(semesterIndex / 3) + 2020;
            const semester = (semesterIndex % 3) + 1;
            const semesterId = `${year}${semester}`;

            const oldRegistration = registeredSubjects[subjectId];
            if (oldRegistration && oldRegistration.semesterId !== semesterId) {
                console.log(`Deleting old registration: SubjectID: ${subjectId}, Old SemesterID: ${oldRegistration.semesterId}`);
                await deleteUserRegisteredSubject(userId, subjectId, oldRegistration.semesterId);
            }

            console.log(`Registering: SubjectID: ${subjectId}, SemesterID: ${semesterId}, SemesterIndex: ${semesterIndex}`);
            return registerSubject(userId, subjectId, semesterId);
        });

        try {
            const results = await Promise.all(registrationPromises);

            const successCount = results.filter(result => result?.data?.success).length;

            if (successCount === registrationPromises.length) {
                message.success('Tất cả các môn được đăng ký thành công');
            } else if (successCount > 0) {
                message.warning(`${successCount} trong số ${registrationPromises.length} các môn được đăng ký thành công`);
            } else {
                message.error('Đăng ký thất bại');
            }

            // Reset the table after successful save
            resetTable();

            // Update registered subjects
            const newRegisteredSubjects = await getUserRegisteredSubjects(userId);
            setRegisteredSubjects(newRegisteredSubjects);
        } catch (error) {
            console.error('Error registering subjects:', error);
            message.error('Có lỗi xảy ra khi đằng ký môn học');
        }
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
                <Button primary small onClick={handleSave}>
                    Lưu
                </Button>
            </div>

            <Table
                key={tableKey}
                department={false}
                onSelectionChange={handleSelectionChange}
            />
        </div>
    );
}

export default DanhSachHocPhan;