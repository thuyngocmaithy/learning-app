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
    const [statescientificResearch, setStatescientificResearch] = useState({
        series: [76, 67],
        options: {
            chart: {
                height: 390,
                type: 'radialBar',
            },
            title: {
                text: 'Đề tài nghiên cứu/ Đề tài khóa luận được thực hiện',
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
            // colors: ['#1ab7ea', '#39539E'],
            colors: ['#28DF99', '#27AA80'],
            labels: ['Đề tài nghiên cứu', 'Khóa luận tốt nghiệp'],
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
                            options={statescientificResearch.options}
                            series={statescientificResearch.series}
                            type="radialBar"
                            height={390}
                            width={400}
                            style={{ display: 'flex', justifyContent: 'center' }}
                        />
                    </div>
                    <div className={cx('chart')}>
                        <ReactApexChart
                            options={stateDegree.options}
                            series={stateDegree.series}
                            type="pie"
                            width={460}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
