import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { useCallback, useContext, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Card from '../../../components/Card';
import styles from './Dashboard.module.scss';
import { HomeActiveIcon } from '../../../assets/icons';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getFacultyById } from '../../../services/facultyService';
import { getUserById } from '../../../services/userService';
import { Spin } from 'antd';
import { getExpectedScoreByStudentId, getScoreByStudentId } from '../../../services/scoreService';
import { ThemeContext } from '../../../context/ThemeContext';
import { getMajorById } from '../../../services/majorService';

const cx = classNames.bind(styles);

function Home() {
    const { theme } = useContext(ThemeContext);
    const { userId } = useContext(AccountLoginContext);
    const [scores, setScores] = useState();
    const [creditHourCurrent, setCreditHourCurrent] = useState(0);
    const [creditHourTotal, setCreditHourTotal] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isLoadingBox, setIsLoadingBox] = useState(true)
    const [isLoadingChart, setIsLoadingChart] = useState(true)
    const [firstYear, setFirstYear] = useState(null);
    const [state, setState] = useState({});
    const [expectedGPA, setExpectedGPA] = useState(0);

    const handleDataChart = useCallback(async (chartData) => {
        setState({
            series: chartData.series,
            options: {
                chart: {
                    type: 'bar',
                    height: 350,
                },
                legend: {
                    labels: {
                        colors: ['var(--color-text-base)', 'var(--color-text-base)'],
                        style: {
                            fontSize: '14px',
                            fontWeight: 600,
                        },
                    },
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'rounded',
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent'],
                },
                xaxis: {
                    categories: chartData.categories,
                    labels: {
                        style: { colors: 'var(--color-text-base)' }
                    },
                },
                yaxis: {
                    labels: {
                        style: { colors: 'var(--color-text-base)' }
                    },
                },
                fill: {
                    opacity: 1,
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val;
                        },
                    },
                },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            plotOptions: {
                                bar: {
                                    horizontal: true,
                                },
                            },
                            chart: {
                                height: 300,
                            },
                            xaxis: {
                                labels: {
                                    show: false,
                                },
                            },
                        },
                    },
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                height: 250,
                            },
                            legend: {
                                position: 'bottom',
                            },
                        },
                    },
                ],
            },
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);


    const fetchChartData = useCallback(async () => {
        if (!firstYear) return;
        try {
            // Nhóm dữ liệu theo học kỳ
            const groupedData = {};

            // Sắp xếp dữ liệu theo semesterId
            const sortedScores = scores.sort((a, b) => {
                return parseInt(a.semester.semesterId) - parseInt(b.semester.semesterId);
            });

            // Lặp qua từng môn học
            sortedScores.forEach((score) => {
                if (score.result) {
                    const semesterId = score.semester.semesterId;
                    const creditHour = parseInt(score.subject.creditHour) || 0;
                    const gpa = parseFloat(score.finalScore10) || 0.0;

                    // Nếu học kỳ chưa có trong groupedData, khởi tạo
                    if (!groupedData[semesterId]) {
                        groupedData[semesterId] = {
                            credits: 0,
                            totalGpa: 0,
                            totalCredits: 0,
                        };
                    }

                    // Cộng dồn tín chỉ và điểm GPA
                    groupedData[semesterId].credits += creditHour;
                    groupedData[semesterId].totalGpa += gpa * creditHour; // GPA nhân tín chỉ
                    groupedData[semesterId].totalCredits += creditHour;
                }

            });

            // Tạo dữ liệu categories và series cho biểu đồ
            const categories = [];
            const creditData = [];
            const gpaData = [];

            Object.keys(groupedData).forEach((semesterId) => {
                const { credits, totalGpa, totalCredits } = groupedData[semesterId];
                const gpa = totalCredits > 0 ? totalGpa / totalCredits : 0;

                // Chuyển semesterId thành tên học kỳ
                const firstSemester = parseInt(`${firstYear}1`);
                const year = Math.floor((parseInt(semesterId) - firstSemester) / 10) + 1;
                const semester = parseInt(semesterId) % 10;
                categories.push(`Năm ${year} - HK${semester}`);

                // Thêm dữ liệu vào mảng
                creditData.push(credits);
                gpaData.push(gpa.toFixed(2)); // Làm tròn GPA 2 chữ số
            });

            // Cập nhật state với dữ liệu đã xử lý
            const chartData = {
                categories,
                series: [
                    {
                        name: 'Số tín chỉ',
                        data: creditData,
                    },
                    {
                        name: 'Điểm trung bình (Hệ 10)',
                        data: gpaData,
                    },
                ],
            };
            handleDataChart(chartData);
        } catch (error) {
            console.error('Error fetching chart data', error);
        } finally {
            setIsLoadingChart(false);
        }
    }, [firstYear, scores, handleDataChart]);




    useEffect(() => {
        // Tính Tiến độ hoàn thành
        const handleDataProgress = async () => {
            try {
                const responseUser = await getUserById(userId);

                const expectedScoreResponse = await getExpectedScoreByStudentId(userId);
                setExpectedGPA(expectedScoreResponse[0]?.expectedGPA || responseUser.data.GPA);
                const responseScore = await getScoreByStudentId(userId);
                setScores(responseScore)
                // Lấy ngành và năm học đầu tiên, số tín chỉ hiện tại của user
                const major = responseUser.data.major.majorId;
                const firstAcademicYear = responseUser.data.firstAcademicYear;
                setFirstYear(firstAcademicYear);
                const cdCurrent = responseUser.data.currentCreditHour;
                setCreditHourCurrent(cdCurrent);

                // Lấy số tín chỉ của ngành
                const responseFaculty = await getMajorById(major);
                const cdTotal = responseFaculty.data.data.creditHourTotal;
                setCreditHourTotal(cdTotal);
                // Math.trunc lấy phần nguyên
                const progressCurrent = Math.trunc((cdCurrent / Number(cdTotal)) * 100);
                setProgress(progressCurrent);

            } catch (error) {
                console.error("Lỗi tính dữ liệu dashboard: " + error);
            }
            finally {
                setIsLoadingBox(false)
            }
        }
        if (userId)
            handleDataProgress();
    }, [userId])

    useEffect(() => {
        if (scores) {
            fetchChartData();
        }
    }, [scores, fetchChartData]);


    return (isLoadingBox || isLoadingChart) ? (
        <div className={('container-loading')}>
            <Spin size="large" />
        </div>
    ) : (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <HomeActiveIcon />
                </span>
                <h3 className={cx('title')}>Dashboard</h3>
            </div>
            <div className={cx('list-card')}>
                <Card icon={<FontAwesomeIcon icon={faChartLine} />} title="Tiến độ hoàn thành" content={`${progress}%`} primary />
                <Card icon={<FontAwesomeIcon icon={faBook} />} title="Số tín chỉ đã học" content={`${creditHourCurrent}/${creditHourTotal}`} />
                <Card icon={<FontAwesomeIcon icon={faGraduationCap} />} title="Điểm tốt nghiệp dự kiến" content={expectedGPA} />
            </div>
            <div className={cx('chart')}>
                <Chart options={state.options} series={state.series} type="bar" height={350} />
            </div>
        </div>
    );
}

export default Home;
