import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { useCallback, useContext, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Card from '../../../components/Card';
import styles from './Dashboard.module.scss';
import { HomeActiveIcon } from '../../../assets/icons';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { GradeScoreContext } from '../../../context/GradeScoreContext';
import { getFacultyById } from '../../../services/facultyService';
import { getScore, getUserById } from '../../../services/userService';
import { Spin } from 'antd';

const cx = classNames.bind(styles);

function Home() {
    const { calculatedGPA } = useContext(GradeScoreContext);
    const { userId, access_token } = useContext(AccountLoginContext);
    const [scores, setScores] = useState();
    const [creditHourCurrent, setCreditHourCurrent] = useState(0);
    const [creditHourTotal, setCreditHourTotal] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isLoadingBox, setIsLoadingBox] = useState(true)
    const [isLoadingChart, setIsLoadingChart] = useState(true)
    const [firstYear, setFirstYear] = useState(null);
    const [state, setState] = useState({});
    const handleDataChart = useCallback(async (chartData) => {
        setState({
            series: chartData.series,
            options: {
                chart: {
                    type: 'bar',
                    height: 350,
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
                },
                yaxis: {
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
            },
        })
    }, []);


    const fetchChartData = useCallback(async () => {
        if (!firstYear) return;
        try {
            // Xử lý dữ liệu điểm theo học kỳ
            const groupedData = {};

            const sortedScores = scores.sort((a, b) => {
                const semesterA = parseInt(a.hoc_ky);
                const semesterB = parseInt(b.hoc_ky);
                // So sánh semesterId
                return semesterA - semesterB;
            });

            sortedScores.forEach(score => {
                const semesterId = score.hoc_ky;
                let creditHour = parseInt(score.so_tin_chi_dat_hk) || 0;
                let gpa = parseFloat(score.dtb_hk_he10) || 0.0;

                // Nếu học kỳ chưa có trong groupedData, khởi tạo
                if (!groupedData[semesterId]) {
                    groupedData[semesterId] = { credits: 0, gpa: 0 };
                }

                const semester = parseInt(semesterId) % 10;
                if (semester === 3) {
                    let tong_gpa_monhoc = 0;
                    score.ds_diem_mon_hoc.forEach((item) => {
                        // Tính số tín chỉ
                        creditHour += parseInt(item.so_tin_chi);
                    })
                    // Tính GPA
                    score.ds_diem_mon_hoc.forEach((item) => {
                        tong_gpa_monhoc += (parseInt(item.diem_tk) * parseInt(item.so_tin_chi));
                    })
                    gpa = tong_gpa_monhoc / creditHour;
                }

                // Cộng tín chỉ và điểm GPA
                groupedData[semesterId].credits += creditHour;
                groupedData[semesterId].gpa += gpa;
            });

            // Dữ liệu cho categories và series
            const categories = [];
            const creditData = [];
            const gpaData = [];

            // Tạo danh sách categories và dữ liệu cho biểu đồ
            Object.keys(groupedData).forEach(semesterId => {
                const { credits, gpa } = groupedData[semesterId];

                // Chuyển semesterId thành tên học kỳ
                const firstSemester = parseInt(`${firstYear}1`);
                const year = Math.floor((parseInt(semesterId) - firstSemester) / 10) + 1;
                const semester = parseInt(semesterId) % 10;
                categories.push(`Năm ${year}-HK${semester}`);

                creditData.push(credits);
                gpaData.push(gpa.toFixed(2)); // Điểm trung bình hệ 4
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
                        name: 'Điểm tích lũy (Hệ 10)',
                        data: gpaData,
                    },
                ],
            };
            handleDataChart(chartData);

        } catch (error) {
            console.error('Error fetching chart data', error);
        }
        finally {
            setIsLoadingChart(false)
        }
    }, [firstYear, scores, handleDataChart]);

    // Tính Tiến độ hoàn thành
    const handleDataProgress = async () => {
        try {
            const responseScore = await getScore(access_token);
            setScores(responseScore.data.ds_diem_hocky)

            let cdCurrent = 0;
            if (responseScore.status === 'success') {
                for (let diem of responseScore.data.ds_diem_hocky) {
                    if (diem.so_tin_chi_dat_tich_luy !== "") {
                        cdCurrent = diem.so_tin_chi_dat_tich_luy;
                        setCreditHourCurrent(diem.so_tin_chi_dat_tich_luy); // set giá trị
                        break; // thoát khỏi vòng lặp
                    }
                }
            }
            // Lấy ngành và năm học đầu tiên của user
            const responseUser = await getUserById(userId);
            const faculty = responseUser.data.faculty.facultyId;
            const firstAcademicYear = responseUser.data.firstAcademicYear;
            setFirstYear(firstAcademicYear);

            // Lấy số tín chỉ của ngành
            const responseFaculty = await getFacultyById(faculty);
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

    useEffect(() => {
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
                <Card icon={<FontAwesomeIcon icon={faGraduationCap} />} title="Điểm tốt nghiệp dự kiến" content={calculatedGPA} />
            </div>
            <div className={cx('chart')}>
                <Chart options={state.options} series={state.series} type="bar" height={350} />
            </div>
        </div>
    );
}

export default Home;
