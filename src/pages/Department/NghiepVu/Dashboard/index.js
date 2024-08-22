import classNames from 'classnames/bind';
import { useState } from 'react';
import Card from '../../../../components/Card';
import styles from './Dashboard.module.scss';
import { CompleteIcon, HomeActiveIcon, UserGroupIcon } from '../../../../assets/icons';
import ReactApexChart from 'react-apexcharts';
import { Divider } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Home() {
    // eslint-disable-next-line no-unused-vars
    const [stateProject, setStateProject] = useState({
        series: [76, 67],
        options: {
            chart: {
                height: 390,
                type: 'radialBar',
            },
            title: {
                text: 'Dự án nghiên cứu/ đề tài khóa luận được thực hiện',
                align: 'center',
            },
            plotOptions: {
                radialBar: {
                    offsetY: 0,
                    startAngle: 0,
                    endAngle: 270,
                    hollow: {
                        margin: 5,
                        size: '30%',
                        background: 'transparent',
                        image: undefined,
                    },
                    dataLabels: {
                        name: {
                            show: false,
                        },
                        value: {
                            show: false,
                        },
                    },
                    barLabels: {
                        enabled: true,
                        useSeriesColors: true,
                        offsetX: -8,
                        fontSize: '16px',
                        formatter: function (seriesName, opts) {
                            return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex];
                        },
                    },
                },
            },
            colors: ['#28DF99', '#27AA80'],
            labels: ['Dự án nghiên cứu', 'Khóa luận tốt nghiệp'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            show: false,
                        },
                    },
                },
            ],
        },
    });
    const [stateDegree, setstateDegree] = useState({
        series: [44, 100, 80, 33],
        options: {
            chart: {
                width: 380,
                type: 'pie',
            },
            title: {
                text: 'Thống kê điểm của sinh viên',
                align: 'center',
            },
            labels: ['Loại xuất sắc', 'Loại giỏi', 'Loại khá', 'Loại trung bình '],
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
        },
    });
    const [stateCore, setStateCore] = useState({
        series: [
            {
                name: 'Số lượng sinh viên',
                data: [10, 15, 25, 30, 20, 10, 5], // Dữ liệu điểm của sinh viên
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 350,
            },
            xaxis: {
                categories: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
                title: {
                    text: 'Khoảng điểm',
                },
            },
            yaxis: {
                title: {
                    text: 'Số lượng sinh viên',
                },
            },
            title: {
                text: 'Biểu đồ phân bố điểm của sinh viên trong khoa',
                align: 'center',
            },
        },
    });
    const [stateIntern, setStateIntern] = useState({
        series: [76, 67, 80, 20],
        options: {
            chart: {
                height: 390,
                type: 'radialBar',
            },
            title: {
                text: 'Thống kê tình trạng thực tập tốt nghiệp',
                align: 'center',
            },
            plotOptions: {
                radialBar: {
                    offsetY: 0,
                    startAngle: 0,
                    endAngle: 270,
                    hollow: {
                        margin: 5,
                        size: '30%',
                        background: 'transparent',
                        image: undefined,
                    },
                    dataLabels: {
                        name: {
                            show: false,
                        },
                        value: {
                            show: false,
                        },
                    },
                    barLabels: {
                        enabled: true,
                        useSeriesColors: true,
                        offsetX: -8,
                        fontSize: '16px',
                        formatter: function (seriesName, opts) {
                            return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex];
                        },
                    },
                },
            },
            colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
            labels: ['Đăng ký', 'Đang thực hiện', 'Đã hoàn thành', 'Bị từ chối'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            show: false,
                        },
                    },
                },
            ],
        },
    });
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <HomeActiveIcon />
                </span>
                <h3 className={cx('title')}>Dashboard</h3>
            </div>
            <div className={cx('list-card')}>
                <Card icon={<UserGroupIcon width="35px" />} title="Số sinh viên trong khoa" content="5.000" primary />
                <Card icon={<CompleteIcon width="35px" />} title="Sinh viên hoàn thành đúng tiến độ" content="70%" />
                <Card icon={<FontAwesomeIcon icon={faGraduationCap} />} title="ĐTB toàn khoa" content="3.2" />
            </div>
            {/* <div className={cx('chart')}>
                <Chart options={state.options} series={state.series} type="bar" height={350} />
            </div> */}
            <Divider />
            <div className={cx('circle-chart')}>
                <div className={cx('container-chart')}>
                    <div className={cx('chart')}>
                        <ReactApexChart
                            options={stateProject.options}
                            series={stateProject.series}
                            type="radialBar"
                            height={390}
                            width={400}
                            style={{ display: 'flex', justifyContent: 'center' }}
                        />
                    </div>
                    <div className={cx('chart')}>
                        <ReactApexChart
                            options={stateIntern.options}
                            series={stateIntern.series}
                            type="radialBar"
                            height={390}
                            width={400}
                            style={{ display: 'flex', justifyContent: 'center' }}
                        />
                    </div>
                </div>
            </div>
            <Divider />
            <div className={cx('circle-chart')}>
                <div className={cx('container-chart')}>
                    <div className={cx('chart')}>
                        <ReactApexChart
                            options={stateDegree.options}
                            series={stateDegree.series}
                            type="pie"
                            width={400}
                        />
                    </div>
                </div>
                <div id="chart">
                    <ReactApexChart
                        options={stateCore.options}
                        series={stateCore.series}
                        type="area"
                        height={350}
                        width={600}
                    />
                </div>
            </div>
        </div>
    );
}

export default Home;
