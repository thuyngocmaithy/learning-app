import classNames from 'classnames/bind';
import styles from './ThongTinDeTaiNCKHThamGia.module.scss';
import { Button, Descriptions, Dropdown, message, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { getStatusByType } from '../../services/statusService';
import { updateSRById } from '../../services/scientificResearchService';

const cx = classNames.bind(styles);

function ThongTinDeTaiNCKHThamGia({ scientificResearch, thesis = false }) {
    console.log(scientificResearch);


    const statusType = 'Tiến độ đề tài NCKH';
    const [statusSelected, setStatusSelected] = useState(
        {
            key: scientificResearch.status.statusId,
            label: scientificResearch.status.statusName
        }
        || {})
    const [statusOptions, setStatusOptions] = useState([]);

    const DISCRIPTION_ITEMS = [
        {
            key: '1-info',
            label: 'Khoa',
            children: scientificResearch ? scientificResearch.scientificResearchGroup?.faculty?.facultyName : '',
        },
        {
            key: '2-info',
            label: 'Thời gian thực hiện',
            children: scientificResearch ? scientificResearch.executionTime : '',
        },
        {
            key: '3-info',
            label: 'Thời điểm bắt đầu',
            children: scientificResearch ? scientificResearch.startDate : '',
        },
        {
            key: '4-info',
            label: 'Hạn hoàn thành',
            children: scientificResearch ? scientificResearch.finishDate : '',
        },
        {
            key: '5-info',
            label: 'Giảng viên hướng dẫn',
            children: scientificResearch ? scientificResearch.instructor?.fullname : '',
        },
        // {
        //     key: '6-info',
        //     label: 'Sinh viên thực hiện',
        //     children: scientificResearch ? scientificResearch.user.fullname : '',
        // },
    ];

    // Fetch danh sách trạng thái theo loại "Tiến độ đề tài nghiên cứu"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const response = await getStatusByType(statusType);
                if (response) {
                    const options = response.map((status) => ({
                        key: status.statusId,
                        label: status.statusName,
                    }));

                    setStatusOptions(options);
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (statusSelected) {
                        setStatusSelected(statusSelected);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    const onClick = async ({ key }) => {
        const selectedItem = statusOptions.find((item) => item.key === key);
        if (selectedItem) {
            const selected = {
                key: key,
                label: selectedItem.label,
            };
            setStatusSelected(selected)

            try {
                let scientificResearchData = {
                    status: key,
                };
                const response = await updateSRById(scientificResearch.scientificResearchId, scientificResearchData);

                if (response && response.data) {
                    message.success('Thay đổi trạng thái đề tài thành công!');
                }

            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className={cx('wrapper-info-detail')}>
            <div className={cx('container-info')}>
                <div className={cx('container-info-detail')}>
                    <Descriptions
                        title={
                            <div className={cx('container-title')}>
                                <h2>Đề tài:</h2>
                                <h2 className={cx("title-SR")}>{scientificResearch.scientificResearchName}</h2>
                                <Tag color="green">
                                    <Dropdown
                                        menu={{
                                            items: statusOptions,
                                            onClick,
                                        }}
                                        trigger={['click']}
                                        placement="bottom"
                                        arrow={{
                                            pointAtCenter: true,
                                        }}
                                    >
                                        <p>{statusSelected.label}</p>
                                    </Dropdown>
                                </Tag>
                            </div>
                        }
                        items={DISCRIPTION_ITEMS}
                    />
                </div>
            </div>
            <div className={cx('container-description')}>
                <h4>Thông tin mô tả</h4>
                <div>
                    {scientificResearch.description}
                </div>
            </div>
        </div>
    );
}

export default ThongTinDeTaiNCKHThamGia;

