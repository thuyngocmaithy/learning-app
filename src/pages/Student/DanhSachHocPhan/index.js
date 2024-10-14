import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import { registerSubject, deleteUserRegisteredSubject } from '../../../services/userService'; // Import the delete function
import { message } from 'antd';
import { getUseridFromLocalStorage } from '../../../services/userService';

const cx = classNames.bind(styles);

function DanhSachHocPhan() {
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [registeredSubjects, setRegisteredSubjects] = useState({}); // Track registered subjects

    const handleSelectionChange = useCallback((newSelection) => {
        setSelectedSubjects(newSelection);
    }, []);

    const handleSave = async () => {
        const userId = getUseridFromLocalStorage();

        // Create an array of promises for subject registrations and deletions
        const registrationPromises = Object.entries(selectedSubjects).map(async ([subjectId, { semesterIndex }]) => {
            // Calculate the new semester ID
            const year = Math.floor(semesterIndex / 3) + 2020; // Assume 2020 is the starting year
            const semester = (semesterIndex % 3) + 1;
            const semesterId = `${year}${semester}`; // Format semesterId as "YYYY0S"

            // Check if the subject is already registered for a different semester
            const oldRegistration = registeredSubjects[subjectId];
            if (oldRegistration && oldRegistration.semesterId !== semesterId) {
                // If the user selected a different semester, delete the old registration
                console.log(`Deleting old registration: SubjectID: ${subjectId}, Old SemesterID: ${oldRegistration.semesterId}`);
                await deleteUserRegisteredSubject(userId, subjectId, oldRegistration.semesterId);
            }

            // Register the subject for the new semester
            console.log(`Registering: SubjectID: ${subjectId}, SemesterID: ${semesterId}, SemesterIndex: ${semesterIndex}`);
            return registerSubject(userId, subjectId, semesterId);
        });

        try {
            const results = await Promise.all(registrationPromises);

            // Updated code to correctly check the "success" inside the "data" object
            const successCount = results.filter(result => result?.data?.success).length;

            if (successCount === registrationPromises.length) {
                message.success('All subjects registered successfully');
            } else if (successCount > 0) {
                message.warning(`${successCount} out of ${registrationPromises.length} subjects registered successfully`);
            } else {
                message.error('Failed to register subjects');
            }

            // Reset selections after registration
            setSelectedSubjects({});
            // Update registered subjects
            const newRegisteredSubjects = await getUserRegisteredSubjects(userId);
            setRegisteredSubjects(newRegisteredSubjects); // Refresh the registered subjects state
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
