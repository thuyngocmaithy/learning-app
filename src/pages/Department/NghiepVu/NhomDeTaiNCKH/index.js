import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { message, Tag } from 'antd';
import { ListCourseIcon, ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import NhomDeTaiNCKHUpdate from '../../../../components/FormUpdate/NhomDeTaiNCKHUpdate';
import { deletescientificResearchGroup, getAllscientificResearchGroup } from '../../../../services/scientificResearchGroupService';
import NCKHListTopic from '../../../../components/FormListTopic/NCKHListTopic';

const cx = classNames.bind(styles);


function NhomDeTaiNCKHNCKH() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [showModalListTopic, setShowModalListTopic] = useState(false); // hiển thị model list topic
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);

    const columns = (showModal) => [
        {
            title: 'Mã đề tài',
            dataIndex: 'scientificResearchGroupId',
            key: 'scientificResearchGroupId',
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'scientificResearchGroupName',
            key: 'scientificResearchGroupName',
        },
        {
            title: 'Khoa',
            dataIndex: ['faculty', 'facultyName'],
            key: 'faculty',
        },
        {
            title: 'Năm thực hiện',
            dataIndex: 'startYear',
            key: 'startYear',
        },
        {
            title: 'Năm kết thúc',
            dataIndex: 'finishYear',
            key: 'finishYear',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status', 'statusName'],
            align: 'center',
            render: (statusName) => (
                <Tag color={statusName === 'Xác định chủ đề và vấn đề nghiên cứu' ? 'green' : 'red'}>
                    {statusName.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom className={cx('btnDetail')} leftIcon={<ListCourseIcon />} outline verysmall onClick={() => {
                        setShowModalListTopic(record);
                    }}>
                        Danh sách
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setShowModalUpdate(record);
                            setIsUpdate(true)
                        }}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchData = async () => {
        try {
            const result = await getAllscientificResearchGroup()
            setData(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);




    const handleDelete = async () => {
        try {
            for (const id of selectedRowKeys) {
                await deletescientificResearchGroup(id);
            }
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - NhomDeTaiNCKH - deleted] - Error', error);
        }
    };


    const NhomDeTaiNCKHUpdateMemoized = useMemo(() => {
        return (
            <NhomDeTaiNCKHUpdate
                title={'nhóm đề tài nghiên cứu'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
            />
        );
    }, [showModalUpdate, isUpdate]);

    const NCKHListTopicMemoized = useMemo(() => {
        return (
            <NCKHListTopic
                showModalListTopic={showModalListTopic}
                setShowModalListTopic={setShowModalListTopic}
            />
        );
    }, [showModalListTopic]);


    return (
        <div className={cx('wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài NCKH</h3>
                </div>

                <div className={cx('wrapper')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModalUpdate(true);
                            setIsUpdate(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('đề tài nghiên cứu', handleDelete)} />
                    <Toolbar type={'Nhập file Excel'} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>

            </div>

            <TableCustomAnt
                height={'350px'}
                columns={columns(setShowModalUpdate)}
                data={data}
                setSelectedRowKeys={setSelectedRowKeys}
                keyIdChange='scientificResearchGroupId'
                loading={isLoading}
            />
            {NhomDeTaiNCKHUpdateMemoized}
            {NCKHListTopicMemoized}
        </div>
    );
}

export default NhomDeTaiNCKHNCKH;
