import classNames from 'classnames/bind';
import { useContext, useEffect, useState } from 'react';
import Card from '../../../../components/Card';
import styles from './Dashboard.module.scss';
import { HomeActiveIcon, UserGroupIcon } from '../../../../assets/icons';
import ReactApexChart from 'react-apexcharts';
import { Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { getWhere as getSRWhere } from '../../../../services/scientificResearchService';
import { getWhere as getThesisWhere } from '../../../../services/thesisService';
import { getWhereUser } from '../../../../services/userService';
import { getAllSRGroup } from '../../../../services/scientificResearchGroupService';
import { ThemeContext } from '../../../../context/ThemeContext';

const cx = classNames.bind(styles);

function Home() {
    const { theme } = useContext(ThemeContext);
    const responsive = [
        {
            breakpoint: 1500, // Định nghĩa kích thước cho màn hình lớn
            options: {
                chart: {
                    width: '100%', // Chiều rộng của biểu đồ cho màn hình lớn
                },
                title: {
                    fontSize: '25px', // Kích thước font tiêu đề khi màn hình lớn
                },
            },
        },
        {
            breakpoint: 1024, // Định nghĩa kích thước cho màn hình vừa (máy tính bảng)
            options: {
                chart: {
                    width: '85%', // Chiều rộng của biểu đồ cho màn hình vừa
                },
                title: {
                    fontSize: '18px', // Kích thước font tiêu đề khi màn hình vừa
                },
            },
        },
        {
            breakpoint: 600, // Định nghĩa kích thước cho màn hình nhỏ (điện thoại)
            options: {
                chart: {
                    width: '100%', // Chiều rộng của biểu đồ cho màn hình nhỏ
                },
                title: {
                    fontSize: '10px', // Kích thước font tiêu đề khi màn hình nhỏ
                },
            },
        },
    ];
    const { userId } = useContext(AccountLoginContext);
    const [isLoadingSRAndThesis_Group, setIsLoadingSRAndThesis_Group] = useState(true);
    const [isLoadingScore, setIsLoadingScore] = useState(true);
    const [isLoadingSRData, setIsLoadingSRData] = useState(true);
    const [isLoadingThesisData, setIsLoadingThesisData] = useState(true);
    const [gradeScore, setGradeScore] = useState([]);
    const [gpaAverage, setGPAAverage] = useState(0);
    const [sv, setSV] = useState(0);

    const [srData, setSRData] = useState({
        categories: [], // Các trạng thái
        data: []        // Số lượng đề tài theo từng trạng thái
    });

    const [thesisData, setThesisData] = useState({
        categories: [], // Các trạng thái
        data: []        // Số lượng đề tài theo từng trạng thái
    });


    const [chartSRGData, setChartSRGData] = useState({
        categories: [], // Tên trạng thái (categories)
        data: []        // Số lượng nhóm đề tài NCKH tương ứng với từng trạng thái
    });

    const [chartThesisGroupData, setChartThesisGroupData] = useState({
        categories: [], // Tên trạng thái (categories)
        data: []        // Số lượng nhóm đề tài Khóa luận tương ứng với từng trạng thái
    });

    // Lấy dữ liệu đề tài khóa luận tham gia theo trạng thái
    useEffect(() => {
        const fetchThesisData = async () => {
            let thesisMap = new Map();
            let thesisResponse = await getThesisWhere({ instructorId: userId });

            if (thesisResponse.status === 200) {
                thesisResponse.data.data.forEach((item) => {
                    const statusName = item.status.statusName;

                    // Kiểm tra nếu trạng thái đã có trong Map
                    if (thesisMap.has(statusName)) {
                        thesisMap.set(statusName, thesisMap.get(statusName) + 1);
                    } else {
                        thesisMap.set(statusName, 1);
                    }
                });

                // Chuyển Map thành các mảng categories và data cho biểu đồ
                const categories = Array.from(thesisMap.keys());
                const data = Array.from(thesisMap.values());

                setThesisData({
                    categories,
                    data
                });
            }
            setIsLoadingThesisData(false);
        };

        fetchThesisData();
    }, [userId]);

    // Lấy dữ liệu đề tài NCKH tham gia theo trạng thái
    useEffect(() => {
        const fetchSRData = async () => {
            let srMap = new Map();
            let srResponse = await getSRWhere({ instructorId: userId });

            if (srResponse.status === 200) {
                srResponse.data.data.forEach((item) => {
                    const statusName = item.status.statusName;

                    // Kiểm tra nếu trạng thái đã có trong Map
                    if (srMap.has(statusName)) {
                        srMap.set(statusName, srMap.get(statusName) + 1);
                    } else {
                        srMap.set(statusName, 1);
                    }
                });

                // Chuyển Map thành các mảng categories và data cho biểu đồ
                const categories = Array.from(srMap.keys());
                const data = Array.from(srMap.values());

                setSRData({
                    categories,
                    data
                });
            }
            setIsLoadingSRData(false);
        };
        if (userId)
            fetchSRData();
    }, [userId]);

    // Lấy dữ liệu nhóm đề tài NCKH và khóa luận theo trạng thái
    useEffect(() => {
        const fetchDataSRAndThesis = async () => {
            try {
                // Lấy nhóm đề tài NCKH theo trạng thái
                let srgMap = new Map();
                const srgResponse = await getAllSRGroup();
                if (srgResponse.status === 200) {
                    srgResponse.data.data.forEach((item) => {
                        // Lấy trạng thái của nhóm đề tài
                        const status = item.status.statusName;

                        // Kiểm tra nếu trạng thái đã có trong Map
                        if (srgMap.has(status)) {
                            // Nếu có, tăng số lượng nhóm đề tài trong trạng thái đó lên 1
                            srgMap.set(item.status.statusName, srgMap.get(status) + 1);
                        } else {
                            // Nếu không có, tạo mới trạng thái và set số lượng là 1
                            srgMap.set(item.status.statusName, 1);
                        }
                    });
                    const categoriesSRG = Array.from(srgMap.keys());  // Lấy tất cả tên trạng thái
                    const dataSRG = Array.from(srgMap.values());     // Lấy tất cả số lượng nhóm đề tài

                    setChartSRGData({
                        categories: categoriesSRG,
                        data: dataSRG
                    });
                }


                // Lấy nhóm đề tài khóa luận theo trạng thái
                let thesisGroupMap = new Map();
                const thesisGroupResponse = await getAllSRGroup();
                if (thesisGroupResponse.status === 200) {
                    thesisGroupResponse.data.data.forEach((item) => {
                        // Lấy trạng thái của nhóm đề tài
                        const status = item.status.statusName;

                        // Kiểm tra nếu trạng thái đã có trong Map
                        if (thesisGroupMap.has(status)) {
                            // Nếu có, tăng số lượng nhóm đề tài trong trạng thái đó lên 1
                            thesisGroupMap.set(item.status.statusName, thesisGroupMap.get(status) + 1);
                        } else {
                            // Nếu không có, tạo mới trạng thái và set số lượng là 1
                            thesisGroupMap.set(item.status.statusName, 1);
                        }
                    });
                    const categoriesThesis = Array.from(thesisGroupMap.keys());  // Lấy tất cả tên trạng thái
                    const dataThesis = Array.from(thesisGroupMap.values());     // Lấy tất cả số lượng nhóm đề tài

                    setChartThesisGroupData({
                        categories: categoriesThesis,
                        data: dataThesis
                    });
                }

            } catch (error) {
                console.error("Lỗi lấy dữ liệu Đề tài nghiên cứu/ Đề tài khóa luận được thực hiện: " + error);
            }
            finally {
                setIsLoadingSRAndThesis_Group(false);
            }
        }
        if (userId) {
            fetchDataSRAndThesis();
        }
    }, [userId])

    useEffect(() => {
        const fetchDataScore = async () => {
            try {
                const response = await getWhereUser({ isStudent: 1 });
                let diemxs = 0;
                let diemgioi = 0;
                let diemkha = 0;
                let diemtb = 0;
                let totalGPA = 0.0;
                let countSV = 0;
                if (response.status === 200) {
                    response.data.data.forEach((item) => {
                        if (!isNaN(item.GPA) && item.GPA) {
                            totalGPA += parseFloat(item.GPA);
                            countSV += 1;
                        }

                        if (item.GPA >= 3.6) diemxs += 1;
                        else if (item.GPA >= 3.2) diemgioi += 1;
                        else if (item.GPA >= 2.5) diemkha += 1;
                        else if (item.GPA >= 2.0) diemtb += 1;
                    })
                    setGradeScore([diemxs, diemgioi, diemkha, diemtb]);
                    setSV(countSV);
                    setGPAAverage((totalGPA / countSV).toFixed(2));
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu điểm - dashboard: " + error);
            }
            finally {
                setIsLoadingScore(false);
            }
        }
        if (userId) fetchDataScore();
    }, [userId])


    return isLoadingSRAndThesis_Group || isLoadingScore || isLoadingSRData || isLoadingThesisData ? (
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
                <Card icon={<FontAwesomeIcon icon={faGraduationCap} />} title="GPA trung bình sinh viên hệ thống" content={gpaAverage} primary />
                <Card icon={<UserGroupIcon width="35px" />} title="Số sinh viên tham gia hệ thống" content={sv} />
                <ReactApexChart
                    options={{
                        chart: {
                            width: 380,
                            type: 'pie',
                        },
                        title: {
                            text: 'Thống kê điểm của sinh viên trong hệ thống',
                            align: 'center',
                            style: { color: 'var(--color-text-base)' }
                        },
                        labels: ['Loại xuất sắc', 'Loại giỏi', 'Loại khá', 'Loại trung bình '],
                        legend: {
                            labels: {
                                colors: ['var(--color-text-base)', 'var(--color-text-base)', 'var(--color-text-base)', 'var(--color-text-base)'],
                                style: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                },
                            },
                        },
                        responsive: [
                            {
                                breakpoint: 480,
                                options: {
                                    chart: {
                                        width: 200,
                                    },
                                    legend: {
                                        position: 'bottom',
                                    },
                                },
                            },
                        ],
                    }}
                    series={gradeScore}
                    type="pie"
                    width={400}
                />
            </div>
            {/* <div className={cx('chart')}>
                <Chart options={state.options} series={state.series} type="bar" height={350} />
            </div> */}
            <div className={cx('container-title')}>
                <h3>Đề tài nghiên cứu khoa học</h3>
            </div>
            <div className={cx('groupSta')}>
                <ReactApexChart
                    options={{
                        title: {
                            text: 'Nhóm đề tài NCKH theo trạng thái',
                            align: 'center',
                            margin: 20,
                            style: {
                                fontWeight: 'bold',
                                color: theme === 'dark' ? '#fff' : '#000000',
                            }
                        },
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                borderRadius: 4,
                                borderRadiusApplication: 'end',
                                horizontal: true,
                            }
                        },
                        dataLabels: {
                            enabled: true,
                        },
                        xaxis: {
                            categories: chartSRGData?.categories,
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        yaxis: {
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        responsive: responsive,
                    }}
                    series={[{ data: chartSRGData?.data }]}
                    type="bar"
                    height={250}
                    width={400}
                />
                <ReactApexChart
                    options={{
                        title: {
                            text: 'Đề tài NCKH tham gia theo trạng thái',
                            align: 'center',
                            margin: 20,
                            style: {
                                fontWeight: 'bold',
                                color: 'var(--color-text-base)'
                            }
                        },
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                borderRadius: 4,
                                borderRadiusApplication: 'end',
                                horizontal: true,
                            }
                        },
                        dataLabels: {
                            enabled: true
                        },
                        xaxis: {
                            categories: srData.categories,
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        yaxis: {
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        responsive: responsive,
                    }}
                    series={[{ data: srData.data }]}
                    type="bar"
                    height={250}
                    width={400}
                />
            </div>
            <div className={cx('container-title')}>
                <h3>Đề tài khóa luận</h3>
            </div>
            <div className={cx('groupSta')}>
                <ReactApexChart
                    options={{
                        title: {
                            text: 'Nhóm đề tài khóa luận theo trạng thái',
                            align: 'center',
                            margin: 20,
                            style: {
                                fontWeight: 'bold',
                                color: 'var(--color-text-base)'
                            }
                        },
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                borderRadius: 4,
                                borderRadiusApplication: 'end',
                                horizontal: true,
                            }
                        },
                        dataLabels: {
                            enabled: true,
                        },
                        xaxis: {
                            categories: chartThesisGroupData?.categories,
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        yaxis: {
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        responsive: responsive,
                    }}
                    series={[{ data: chartThesisGroupData?.data }]}
                    type="bar"
                    height={250}
                    width={400}
                />
                <ReactApexChart
                    options={{
                        title: {
                            text: 'Đề tài khóa luận tham gia theo trạng thái',
                            align: 'center',
                            margin: 20,
                            style: {
                                fontWeight: 'bold',
                                color: 'var(--color-text-base)'
                            }
                        },
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                borderRadius: 4,
                                borderRadiusApplication: 'end',
                                horizontal: true,
                            }
                        },
                        dataLabels: {
                            enabled: true
                        },
                        xaxis: {
                            categories: thesisData.categories,
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        yaxis: {
                            labels: {
                                style: { colors: 'var(--color-text-base)' }
                            },
                        },
                        responsive: responsive,
                    }}
                    series={[{ data: thesisData.data }]}
                    type="bar"
                    height={250}
                    width={400}
                />
            </div>
        </div >
    );
}

export default Home;
