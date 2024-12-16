import classNames from 'classnames/bind';
import styles from './ThongTinDeTaiKhoaLuanThamGia.module.scss';
import { Descriptions, Dropdown, Tag } from 'antd';
import { message } from '../../hooks/useAntdApp';
import { useEffect, useState } from 'react';
import { getStatusByType } from '../../services/statusService';
import { updateThesisById } from '../../services/thesisService';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function ThongTinDeTaiKhoaLuanThamGia({ thesis }) {
    const statusType = 'Tiến độ đề tài khóa luận';
    const [statusSelected, setStatusSelected] = useState(
        {
            key: thesis.status.statusId,
            label: thesis.status.statusName,
            color: thesis.status.color
        }
        || {})
    const [statusOptions, setStatusOptions] = useState([]);

    const DISCRIPTION_ITEMS = [
        {
            key: '0-info',
            label: 'Nhóm đề tài khóa luận',
            children: thesis ? thesis.thesisGroup?.thesisGroupName : '',
        },
        {
            key: '1-info',
            label: 'Ngành',
            children: thesis ? thesis.thesisGroup?.faculty?.facultyName : '',
        },
        {
            key: '2-info',
            label: 'Thời điểm bắt đầu',
            children: thesis?.startDate ? dayjs(thesis.startDate).format('DD/MM/YYYY HH:mm') : '',
        },
        {
            key: '3-info',
            label: 'Hạn hoàn thành',
            children: thesis?.finishDate ? dayjs(thesis.finishDate).format('DD/MM/YYYY HH:mm') : '',
        },
        {
            key: '4-info',
            label: 'Giảng viên hướng dẫn',
            children: thesis ? thesis.instructor?.fullname : '',
        },
        {
            key: '5-info',
            label: 'Số lượng thành viên',
            children: thesis ? thesis.numberOfMember : '',
        },
        {
            key: '6-info',
            label: 'Ngân sách',
            children: thesis ? thesis.budget : '',
        },
        {
            key: '7-info',
            label: 'Sinh viên thực hiện',
            children: thesis
                ?
                thesis?.users?.length > 0 &&
                <ul className={cx('list-student-perform')}>
                    {thesis?.users?.map(itemUser => {
                        if (itemUser.isApprove === 1)
                            return <li key={itemUser.userId} className={cx('student-perform')}>{itemUser.userId} - {itemUser.fullname}</li>
                    })}
                </ul>
                : '',
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
                let thesisData = {
                    status: key,
                };
                const response = await updateThesisById(thesis.thesisId, thesisData);

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
                                <h2 className={cx("title-Thesis")}>{thesis.thesisName}</h2>
                                <Tag color={statusSelected.color} className='status-detail'>
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
                                        overlayStyle={{ width: 'fit-content', maxWidth: '200px' }}
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
                    {thesis.description}
                </div>
            </div>
        </div>
    );
}

export default ThongTinDeTaiKhoaLuanThamGia;

