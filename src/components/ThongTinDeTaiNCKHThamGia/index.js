import classNames from 'classnames/bind';
import styles from './ThongTinDeTaiNCKHThamGia.module.scss';
import { Descriptions, Dropdown, message, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { getStatusByType } from '../../services/statusService';
import { updateSRById } from '../../services/scientificResearchService';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function ThongTinDeTaiNCKHThamGia({ scientificResearch }) {
    const statusType = 'Tiến độ đề tài NCKH';
    const [statusSelected, setStatusSelected] = useState(
        {
            key: scientificResearch.status.statusId,
            label: scientificResearch.status.statusName,
            color: scientificResearch.status.color
        }
        || {})
    const [statusOptions, setStatusOptions] = useState([]);

    const DISCRIPTION_ITEMS = [
        {
            key: '0-info',
            label: 'Nhóm đề tài khóa luận',
            children: scientificResearch ? scientificResearch.scientificResearchGroup?.scientificResearchGroupName : '',
        },
        {
            key: '1-info',
            label: 'Ngành',
            children: scientificResearch ? scientificResearch.scientificResearchGroup?.faculty?.facultyName : '',
        },
        {
            key: '2-info',
            label: 'Thời điểm bắt đầu',
            children: scientificResearch?.startDate ? dayjs(scientificResearch.startDate).format('DD/MM/YYYY HH:mm') : '',
        },
        {
            key: '3-info',
            label: 'Hạn hoàn thành',
            children: scientificResearch?.finishDate ? dayjs(scientificResearch.finishDate).format('DD/MM/YYYY HH:mm') : '',
        },
        {
            key: '4-info',
            label: 'Giảng viên hướng dẫn',
            children: scientificResearch ? scientificResearch.instructor?.fullname : '',
        },
        {
            key: '5-info',
            label: 'Số lượng thành viên',
            children: scientificResearch ? scientificResearch.numberOfMember : '',
        },
        {
            key: '6-info',
            label: 'Ngân sách',
            children: scientificResearch ? scientificResearch.budget : '',
        },
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
                        color: status.color
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
                color: selectedItem.color
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
                                <div className={cx('title')}>
                                    Đề tài: {scientificResearch.scientificResearchName}
                                </div>
                                <Tag color={statusSelected.color} className={cx('status-detail')}>
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
        </div >
    );
}

export default ThongTinDeTaiNCKHThamGia;

