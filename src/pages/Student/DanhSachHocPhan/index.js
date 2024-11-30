import React, { useState, useEffect, useContext, memo } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import {
    getUserById,
    saveRegisterSubjects
} from '../../../services/userService';
import { Descriptions, Radio, Spin } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { findKhungCTDTByUserId } from '../../../services/studyFrameService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { createSemester, getSemesterById } from '../../../services/semesterService';
import { createCycle, getWhere } from '../../../services/cycleService';

const cx = classNames.bind(styles);
function DanhSachHocPhan() {
    const { userId } = useContext(AccountLoginContext);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [frameId, setFrameId] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [valueStatus, setValueSatus] = useState('Tất cả');

    useEffect(() => {
        const fetchKhungCTDT = async () => {
            setIsLoading(true);
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
        if (userId)
            fetchKhungCTDT();
    }, [userId])

    const handleSave = async () => {

        const promises = Object.keys(registeredSubjects).map(async (key) => {
            // Kiểm tra semester có trong db chưa
            const responseSemesterExist = await getSemesterById(registeredSubjects[key].semesterId)
            if (responseSemesterExist.status === 204) {
                const responseUser = await getUserById(userId);
                const startYear = responseUser.data.firstAcademicYear;
                const endYear = responseUser.data.lastAcademicYear;

                // Kiểm tra có chu kỳ trong db chưa
                const responseCycleExist = await getWhere({ startYear: startYear, endYear: endYear });
                let createCycleData;
                if (responseCycleExist.status === 204) {
                    // Chưa có trong db => Tạo chu kỳ mới
                    const cycleName = `${startYear}-${endYear}`;
                    const createCycleRes = await createCycle({
                        cycleName: cycleName,
                        startYear: startYear,
                        endYear: endYear
                    })
                    createCycleData = createCycleRes.data.data;
                }
                else {
                    createCycleData = responseCycleExist.data.data;
                }
                // Chưa có trong db => Tạo kỳ mới
                await createSemester({
                    semesterId: registeredSubjects[key].semesterId,
                    semesterName: String(registeredSubjects[key].semesterId).slice(-1), // Ký tự cuối của semesterId
                    academicYear: String(registeredSubjects[key].semesterId).slice(0, 4), // 4 ký tự đầu của semesterId
                    cycle: createCycleData.cycleId
                })
            }
            return {
                user: userId,
                subject: key,
                semester: registeredSubjects[key].semesterId
            }
        });
        const result = await Promise.all(promises);
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
                <div className={cx('toolbar')}>
                    <div className={cx('filter')}>
                        <Radio.Group block options={options} defaultValue="Tất cả" optionType="button" onChange={handleChange} />
                    </div>
                    <div className={cx('action')}>
                        <Button className={cx('btnSave')} primary small onClick={handleSave}>
                            Lưu
                        </Button>
                    </div>
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

export default memo(DanhSachHocPhan);