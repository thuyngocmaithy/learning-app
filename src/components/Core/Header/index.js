import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faArrowRightFromBracket, faFileImport } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Menu from '../../Popper/Menu';
import { BellIcon, UserIcon } from '../../../assets/icons';
import Notification from '../../Popper/Notification';
import { Navigate } from 'react-router-dom';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Badge, Switch } from 'antd';
import { message } from "../../../hooks/useAntdApp"
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import config from '../../../config';
import UserInfo from '../../UserInfo';
import { MoonFilled, MoonOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../../context/ThemeContext';
import ExcelJS from 'exceljs';
import ImportScore from '../../ImportScore';
import { importScore } from '../../../services/scoreService';
import { updateUserById } from '../../../services/userService';

const cx = classNames.bind(styles);

function Header() {
    const { userId, permission } = useContext(AccountLoginContext);
    const { theme, toggleTheme } = useContext(ThemeContext)
    const { avatar, updateUserInfo } = useContext(AccountLoginContext)
    const { notifications } = useSocketNotification();
    const [countNotRead, setCountNotRead] = useState(0);
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [showModalImport, setShowModalImport] = useState(false);
    const [isLoadingImport, setIsLoadingImport] = useState(false);
    const fileInputRef = useRef(null); // Khởi tạo ref cho input file



    // LOGOUT
    function logout() {
        localStorage.removeItem('userLogin');
        localStorage.removeItem('token');
        updateUserInfo();
        // Redirect to login page
        <Navigate to={config.routes.Login} replace />
    }
    const handleShowInfo = () => {
        setShowModalInfo(true);
    }

    // Import điểm từ SGU
    const handleImportScore = useCallback(async () => {
        const file = fileInputRef.current;
        if (!file) return;

        setIsLoadingImport(true);

        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();

        // Đọc file bằng FileReader
        reader.onload = async (e) => {
            const buffer = e.target.result;
            await workbook.xlsx.load(buffer); // Load file Excel vào workbook

            const worksheet = workbook.getWorksheet(1); // Chọn sheet đầu tiên
            const data = [];

            let semesterId = null; // Biến lưu trữ ID học kỳ và năm học
            let currentSemester = ""; // Biến tạm lưu thông tin học kỳ và năm học

            let checkGPA = true;
            let gpa4 = null;
            let credit = null;

            // Lấy dữ liệu từng hàng trong sheet
            worksheet?.eachRow((row, rowIndex) => {
                // Bỏ qua dòng tiêu đề (dòng đầu tiên)
                if (rowIndex === 1) return;

                const firstCellValue = row.getCell(1).value; // Lấy giá trị ở cột đầu tiên (cột A)

                // Kiểm tra nếu cột đầu tiên chứa giá trị bắt đầu với "Học kỳ"
                if (firstCellValue && typeof firstCellValue === 'string' && firstCellValue.startsWith("Học kỳ")) {
                    // Lấy thông tin học kỳ và năm học từ cột đầu tiên
                    const semesterMatch = firstCellValue.match(/Học kỳ (\d+) - Năm học (\d{4}) - (\d{4})/);
                    if (semesterMatch) {
                        const semesterNumber = semesterMatch[1]; // Lấy số học kỳ (1)
                        const year = semesterMatch[2]; // Lấy năm học đầu tiên (2025)
                        semesterId = `${year}${semesterNumber}`; // Kết hợp thành 20251
                        currentSemester = semesterId; // Gán vào biến currentSemester
                    }
                } else {
                    // Kiểm tra nếu cột G (finalScore4) có giá trị thì mới xử lý môn học và điểm
                    const finalScore4 = row.getCell(7).value; // Cột G
                    const valueA = row.getCell(1).value; // Lấy giá trị cột đầu => Nếu là kiểu chuỗi thì bỏ qua
                    if (typeof valueA === 'string' && checkGPA) {
                        // Sử dụng regex để tìm giá trị "Điểm trung bình tích lũy hệ 4" và "Số tín chỉ tích lũy"
                        const regexGpa4 = /Điểm trung bình tích lũy hệ 4:(\d+\.\d+)/;
                        const regexCredit = /Số tín chỉ tích lũy:(\d+)/;

                        // Tìm giá trị Điểm trung bình tích lũy hệ 4
                        const gpa4Match = valueA.match(regexGpa4);
                        gpa4 = gpa4Match ? gpa4Match[1] : null; // Nếu có kết quả, lấy giá trị, nếu không, trả về null

                        // Tìm giá trị Số tín chỉ tích lũy
                        const creditMatch = valueA.match(regexCredit);
                        credit = creditMatch ? creditMatch[1] : null; // Nếu có kết quả, lấy giá trị, nếu không, trả về null

                        if (gpa4 && credit) {
                            checkGPA = false;// ngưng kiểm tra khi có giá trị
                        }
                    }
                    if (finalScore4 && typeof valueA === 'number') {
                        const rowData = {
                            student: { userId },
                            subject: {
                                subjectId: row.getCell(2).value, // Cột B - Mã môn học
                                subjectName: row.getCell(4).value, // Cột D - Tên môn học
                                creditHour: row.getCell(5).value, // Cột E - Số tín chỉ
                            },
                            semester: { semesterId: currentSemester }, // Sử dụng thông tin học kỳ đã xác định
                            finalScore10: row.getCell(6).value, // Cột F
                            finalScore4: finalScore4, // Cột G
                            finalScoreLetter: row.getCell(8).value, // Cột H
                        };
                        data.push(rowData);
                    }
                }
            });

            try {
                const [resImport, resUppdateDataUser] = await Promise.all([
                    await importScore(data),
                    await updateUserById(userId, {
                        GPA: gpa4,
                        currentCreditHour: credit
                    })
                ]);
                if (resImport.message === "success" && resUppdateDataUser.status === "success") {
                    message.success("Nhập điểm thành công");
                }
            } catch (error) {
                message.error("Lỗi nhập điểm, vui lòng kiểm tra lại file excel");
            }
            finally {
                setIsLoadingImport(false);
                fileInputRef.current = null;
            }
        };

        reader.readAsArrayBuffer(file); // Đọc file dưới dạng ArrayBuffer
    }, [userId]);



    const MENU_ITEMS = [
        {
            icon: <FontAwesomeIcon icon={faCircleInfo} />,
            title: 'Thông tin cá nhân',
            onClick: handleShowInfo,
        },
        {
            icon: <FontAwesomeIcon icon={faFileImport} />,
            title: 'Nhập điểm',
            onClick: () => { setShowModalImport(true) },
            disabled: permission === "SINHVIEN" ? false : true
        },
        {
            icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
            title: 'Đăng xuất',
            onClick: logout,
            separate: true,
        },
    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const count = notifications.filter(item => !item.isRead).length;
                setCountNotRead(count);
            } catch (err) {
                console.error(err)
            }
        };
        fetchNotifications();
    }, [notifications]);

    const UserInfoMemoized = useMemo(() => (
        <UserInfo
            showModal={showModalInfo}
            onClose={() => {
                setShowModalInfo(false);
            }}
        />
    ), [showModalInfo]);

    const ImportScoreMemoized = useMemo(() => {
        return (
            <ImportScore
                showModal={showModalImport}
                onClose={() => {
                    setShowModalImport(false);
                }}
                fileRef={fileInputRef}
                onSave={handleImportScore}
                isLoading={isLoadingImport}
            />
        );
    }, [showModalImport, handleImportScore, isLoadingImport]);

    return (
        <div className={cx('wrapper', theme === 'dark' ? 'dark' : '')}>
            <div className={cx('actions')}>
                <span>
                    <Switch
                        checked={theme === "dark" ? true : false}
                        checkedChildren={<MoonFilled />}
                        unCheckedChildren={<MoonOutlined />}
                        onChange={toggleTheme}
                    />
                </span>
                <span>
                    <Notification>
                        <span>
                            <Badge count={countNotRead}>
                                <BellIcon className={cx('icon', 'bell-icon')} />
                            </Badge>
                        </span>
                    </Notification>
                </span>
                <span>
                    <Menu items={MENU_ITEMS}>
                        <span>
                            {avatar ?
                                <Avatar className={cx('icon', 'user-icon')} src={`data:image/jpeg;base64,${avatar}`} />
                                : <UserIcon className={cx('icon', 'user-icon')} />}
                        </span>
                    </Menu>
                </span>
            </div>
            {UserInfoMemoized}
            {ImportScoreMemoized}
        </div>
    );
}

export default Header;

