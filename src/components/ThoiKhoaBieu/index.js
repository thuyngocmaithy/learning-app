import classNames from "classnames/bind";
import styles from "./ThoiKhoaBieu.module.scss";
import { Card, Collapse, Divider, List } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountLoginContext } from "../../context/AccountLoginContext";
import { getUserRegisteredSubjects } from "../../services/userService";

const cx = classNames.bind(styles);

// Hàm xử lý dữ liệu khóa học đã đăng ký
async function processCourseRegister(userId) {
    const registeredSubjectsRes = await getUserRegisteredSubjects(userId);

    const registeredMap = {};
    if (registeredSubjectsRes?.length) {
        registeredSubjectsRes.forEach((registration) => {
            const { semesterId, semesterName, academicYear } = registration.semester;
            const semesterKey = `Học kỳ ${semesterName} - Năm ${academicYear}`;

            // Nếu chưa có semesterId thì khởi tạo dữ liệu
            if (!registeredMap[semesterId]) {
                registeredMap[semesterId] = {
                    semesterName: semesterKey,
                    subjects: [],
                    totalCredits: 0,
                };
            }

            // Thêm thông tin môn học vào danh sách
            registeredMap[semesterId].subjects.push({
                subjectId: registration.subject.subjectId,
                subjectName: registration.subject.subjectName,
                creditHour: registration.subject.creditHour,
            });

            // Cập nhật tổng số tín chỉ trong kỳ học đó
            registeredMap[semesterId].totalCredits += registration.subject.creditHour;
        });
    }

    return registeredMap;
}

function ThoiKhoaBieu({ registeredSubjects, frameId }) {
    const { userId } = useContext(AccountLoginContext);
    const [dataSemester, setDataSemester] = useState([]); // State lưu thông tin học kỳ
    const [activeKeys, setActiveKeys] = useState([]); // State lưu thông tin panel đang mở rộng

    // Hàm lấy dữ liệu khóa học từ backend
    const fetchCourseData = useCallback(async () => {
        if (!frameId) return;

        const registeredMap = await processCourseRegister(userId);

        const sortedKeys = Object.keys(registeredMap)
            .map(Number)
            .sort((a, b) => a - b); // Sắp xếp theo semesterId tăng dần

        const semesters = sortedKeys.map((semesterId) => ({
            key: semesterId,
            header: <h3 className={cx("title-tkb")}>{registeredMap[semesterId].semesterName}</h3>, // Tiêu đề của học kỳ
            subjects: registeredMap[semesterId].subjects, // Danh sách môn học
            totalCredits: registeredMap[semesterId].totalCredits, // Tổng số tín chỉ
        }));

        setDataSemester(semesters);
        setActiveKeys(sortedKeys); // Mở rộng tất cả panel mặc định
    }, [userId, frameId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    // Dữ liệu truyền vào Collapse thông qua `items`
    const items = dataSemester.map((semester) => ({
        key: semester.key,
        label: semester.header, // Tiêu đề hiển thị của panel
        children: (
            <>
                {/* Hiển thị danh sách môn học của kỳ */}
                <List
                    grid={{
                        gutter: 16,
                        column: 4,
                    }}
                    dataSource={semester.subjects}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                title={`${item.subjectId} - ${item.subjectName}`}
                                size="small"
                                className={cx("card-subject")}
                            >
                                <div className={cx("item-description")}>
                                    Giảng viên:
                                </div>
                                <div className={cx("item-description")}>
                                    Số tín chỉ: {item.creditHour}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
                <Divider />
                {/* Hiển thị tổng số tín chỉ của học kỳ đó */}
                <div className={cx("container-credit")}>
                    <h3>Tổng số tín chỉ: {semester.totalCredits}</h3>
                </div>
            </>
        ),
    }));

    return (
        <div className={cx("wrapper")}>
            <Collapse
                activeKey={activeKeys} // Mở rộng tất cả panel mặc định
                onChange={(keys) => setActiveKeys(keys)} // Cho phép người dùng mở/gập panel
                items={items} // Truyền `items` thay vì `children`
            />
        </div>
    );
}

export default ThoiKhoaBieu;
