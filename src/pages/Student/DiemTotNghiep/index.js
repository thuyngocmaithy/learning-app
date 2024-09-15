import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './DiemTotNghiep.module.scss';
import { InputNumber } from 'antd';
import { GraduateActiveIcon } from '../../../assets/icons';
import TableScore from '../../../components/TableScore';
import ButtonCustom from '../../../components/Core/Button';

const cx = classNames.bind(styles);

function DiemTotNghiep() {
    // State management
    const [currentGPA, setCurrentGPA] = useState(2.69);
    const [currentCredits, setCurrentCredits] = useState(104);
    const [totalCredits, setTotalCredits] = useState(132);
    const [creditsA, setCreditsA] = useState(19);
    const [creditsB, setCreditsB] = useState(20);
    const [creditsC, setCreditsC] = useState(10);
    const [creditsD, setCreditsD] = useState(10);
    const [improvedCredits, setImprovedCredits] = useState(4);
    const [calculatedGPA, setCalculatedGPA] = useState(currentGPA);
    const [remainingCredits, setRemainingCredits] = useState(0);
    const [totalscientificResearchedCredits, setTotalscientificResearchedCredits] = useState(0);
    const [graduationType, setGraduationType] = useState('');

    // Handle input changes
    useEffect(() => {
        calculateResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGPA, currentCredits, totalCredits, creditsA, creditsB, creditsC, creditsD, improvedCredits]);

    const calculateResults = () => {
        const gradePointsA = creditsA * 4.0;
        const gradePointsB = creditsB * 3.0;
        const gradePointsC = creditsC * 2.0;
        const gradePointsD = creditsD * 1.0;

        const totalGradePoints = gradePointsA + gradePointsB + gradePointsC + gradePointsD;
        const totalscientificResearchedCredits = creditsA + creditsB + creditsC + creditsD + improvedCredits;

        const newGPA = parseFloat((totalGradePoints / totalscientificResearchedCredits).toFixed(2));
        const remainingCredits = totalCredits - (currentCredits - improvedCredits);

        setCalculatedGPA(newGPA);
        setRemainingCredits(remainingCredits);
        setTotalscientificResearchedCredits(totalscientificResearchedCredits);

        // Determine graduation type based on the new GPA
        if (newGPA >= 3.6) {
            setGraduationType('Xuất sắc');
        } else if (newGPA >= 3.2) {
            setGraduationType('Giỏi');
        } else if (newGPA >= 2.5) {
            setGraduationType('Khá');
        } else if (newGPA >= 2.0) {
            setGraduationType('Trung bình');
        } else {
            setGraduationType('Yếu');
        }
    };

    return (
        <div className={cx('wrapper-graduation')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <GraduateActiveIcon />
                </span>
                <h3 className={cx('title')}>Điểm tốt nghiệp dự kiến</h3>
            </div>
            <div className={cx('title-sapxep-diem')}>
                <h3>Sắp xếp điểm dự kiến</h3>
            </div>
            <TableScore />
            <div className={cx('footer-table')}>
                <ButtonCustom primary small className={cx('btnSave')}>
                    Lưu
                </ButtonCustom>
            </div>
            <div className={cx('title-sapxep-diem')}>
                <h3>Điểm tốt nghiệp dự kiến (sau khi sắp xếp)</h3>
            </div>
            <div className={cx('wrapper')}>
                <div className={cx('content-left')}>
                    <div className={cx('content-left-item')}>
                        <label>Điểm trung bình tích lũy hiện tại (hệ 4)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0.0}
                            max={4.0}
                            step={0.1}
                            value={currentGPA}
                            onChange={(value) => setCurrentGPA(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ tích lũy hiện tại</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={currentCredits}
                            onChange={(value) => setCurrentCredits(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Tổng số tín chỉ của ngành</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={totalCredits}
                            onChange={(value) => setTotalCredits(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại A (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={creditsA}
                            onChange={(value) => setCreditsA(value)}
                            disabled
                        />
                    </div>

                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại B (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={creditsB}
                            onChange={(value) => setCreditsB(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại C (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={creditsC}
                            onChange={(value) => setCreditsC(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại D (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={creditsD}
                            onChange={(value) => setCreditsD(value)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ cải thiện</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={improvedCredits}
                            onChange={(value) => setImprovedCredits(value)}
                            disabled
                        />
                    </div>
                </div>
                <div className={cx('content-right')}>
                    <div className={cx('info-right')}>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ còn lại:</span>
                            <span className={cx('value-info')}>{remainingCredits}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Tổng số tín chỉ dự kiến đang nhập:</span>
                            <span className={cx('value-info')}>{totalscientificResearchedCredits}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ cần nhập lại:</span>
                            <span className={cx('value-info')}>{remainingCredits - totalscientificResearchedCredits}</span>
                        </div>
                    </div>
                    <div className={cx('result-right')}>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Điểm chung bình tích lũy:</span>
                            <span className={cx('value-result')}>{calculatedGPA}</span>
                        </div>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Bằng tốt nghiệp:</span>
                            <span className={cx('value-result')}>{graduationType}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiemTotNghiep;
