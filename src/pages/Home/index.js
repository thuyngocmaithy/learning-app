import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { useState } from 'react';
import Chart from "react-apexcharts";
import Card from "../../components/Card";
import styles from "./Home.module.scss"

const cx = classNames.bind(styles)

function Home() {
    // eslint-disable-next-line no-unused-vars
    const [state, setState] = useState({
        series: [{
            name: 'Số tín chỉ',
            data: [20, 19, 18, 21, 19, 19, 22, 17, 18, 19, 22, 17, 18]
        }, {
            name: 'Điểm tích lũy',
            data: [3.0, 2.0, 2.5, 3.2, 3.0, 2.0, 2.5, 3.2, 3.5, 2.0, 2.5, 3.2, 3.5]
        }],
        options: {
            chart: {
                type: 'bar',
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['Năm 1-HK1', 'Năm 1-HK2', 'Năm 1-HK3', 'Năm 2-HK1', 'Năm 2-HK2', 'Năm 2-HK3', 'Năm 3-HK1', 'Năm 3-HK2', 'Năm 3-HK3', 'Năm 4-HK1', 'Năm 4-HK2', 'Năm 4-HK3', 'Năm 5-HK1'],
            },
            yaxis: {
                // title: {
                //     text: '$ (thousands)'
                // }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val
                    }
                }
            }
        },
    })

    return <div className={cx('wrapper')}>
        <div className={cx('list-card')}>
            <Card icon={<FontAwesomeIcon icon={faChartLine} />} title='Tiến độ hoàn thành' content="57%" primary />
            <Card icon={<FontAwesomeIcon icon={faBook} />} title='Số môn đã học' content="30/70" />
            <Card icon={<FontAwesomeIcon icon={faGraduationCap} />} title='Điểm tốt nghiệp dự kiến' content="3.5" />
        </div>
        <div className={cx('chart')}>
            <Chart options={state.options} series={state.series} type="bar" height={350} />
        </div>
    </div>;
}

export default Home;


