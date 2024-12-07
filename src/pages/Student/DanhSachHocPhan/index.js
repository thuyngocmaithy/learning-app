import { useState, useEffect, useContext, memo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import {
    getUserById,
    saveRegisterSubjects
} from '../../../services/userService';
import { Descriptions, Empty, Radio, Spin, Tabs } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { findKhungCTDTByUserId } from '../../../services/studyFrameService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { createSemester, getSemesterById } from '../../../services/semesterService';
import { createCycle, getWhere } from '../../../services/cycleService';
import { useLocation, useNavigate } from 'react-router-dom';
import ThoiKhoaBieu from '../../../components/ThoiKhoaBieu';

const cx = classNames.bind(styles);
function DanhSachHocPhan() {
    const { userId } = useContext(AccountLoginContext);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [frameId, setFrameId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [valueStatus, setValueSatus] = useState('Tất cả');
    // Xử lý active tab từ url
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);

    useEffect(() => {
        const fetchKhungCTDT = async () => {
            setIsLoading(true);
            try {
                const res = await findKhungCTDTByUserId(userId);
                if (res.status === 200) {
                    setFrameId(res.data?.data?.frameId);
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

    // Set tab được chọn vào state 
    const handleTabClick = (index) => {
        setTabActive(index)
    };


    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);

        // Kiểm tra nếu tabIndex chưa có trong URL thì thêm mới
        if (!params.has('tabIndex')) {
            params.append('tabIndex', tabId);
        } else {
            params.set('tabIndex', tabId); // Cập nhật giá trị mới cho tabIndex nếu đã có
        }

        // Cập nhật URL với params mới        
        navigate(`${currentUrl.pathname}?${params.toString()}`);

        setTabActive(tabId);
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Quản lý tiến độ',
            children: (
                <>
                    <Descriptions items={items} className={cx('description')} />
                    <Table
                        frameId={frameId}
                        registeredSubjects={registeredSubjects}
                        setRegisteredSubjects={setRegisteredSubjects}
                        status={valueStatus}
                    />
                </>
            ),
        },
        {
            id: 2,
            title: 'Thời khóa biểu theo kỳ sắp xếp',
            children: (
                <>
                    <ThoiKhoaBieu
                        registeredSubjects={registeredSubjects}
                        frameId={frameId}
                    />
                </>
            ),
        },
    ];



    // if (isLoading) {
    //     return (
    //         <div className={cx('container-loading')}>
    //             <Spin size="large" />
    //         </div>
    //     );
    // }

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
            {frameId
                ? <Tabs
                    activeKey={tabActive}
                    onChange={handleTabChange}
                    centered
                    onTabClick={(index) => handleTabClick(index)}
                    items={ITEM_TABS.map((item, index) => ({
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    }))}
                />
                :
                !isLoading
                    ? <Empty className={cx("empty")} description="Chưa có dữ liệu cho chương trình đào tạo của bạn" />
                    : null
            }
        </div >
    );
}

export default memo(DanhSachHocPhan);