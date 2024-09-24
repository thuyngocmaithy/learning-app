import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import { registerSubject } from '../../../services/userService';
import { message } from 'antd';
import { getUseridFromLocalStorage } from '../../../services/userService';

const cx = classNames.bind(styles);

function DanhSachHocPhan() {
    const [selectedSubjects, setSelectedSubjects] = useState({});

    const handleSelectionChange = useCallback((newSelection) => {
        setSelectedSubjects(newSelection);
    }, []);

    const handleSave = async () => {
        const registrationPromises = Object.entries(selectedSubjects).map(([subjectId, { frameId, semesterIndex }]) => {
            const year = Math.floor(semesterIndex / 3) + 2020; // Assuming 2020 is the base year
            const semester = (semesterIndex % 3) + 1;
            const semesterId = `${year}${semester}`;
            return registerSubject(getUseridFromLocalStorage(), subjectId, frameId, semesterId);
        });

        try {
            const results = await Promise.all(registrationPromises);
            const successCount = results.filter(result => result && result.success).length;

            if (successCount === registrationPromises.length) {
                message.success('All subjects registered successfully');
            } else if (successCount > 0) {
                message.warning(`${successCount} out of ${registrationPromises.length} subjects registered successfully`);
            } else {
                message.error('Failed to register subjects');
            }

            // Reset selections after registration
            setSelectedSubjects({});
        } catch (error) {
            console.error('Error registering subjects:', error);
            message.error('An error occurred while registering subjects');
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

            <Table department={false} onSelectionChange={handleSelectionChange} />
        </div>
    );
}

export default DanhSachHocPhan;