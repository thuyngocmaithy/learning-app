import classNames from 'classnames/bind';
import styles from './NCKHListTopic.module.scss';
import { Card, message, Modal, notification, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import config from "../../../config"
import { useCallback, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../components/Core/Button';
import TableCustomAnt from '../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../components/Core/Delete';
import DeTaiNCKHUpdate from '../../../components/FormUpdate/DeTaiNCKHUpdate';

import { deletescientificResearch, getAllscientificResearch, getByScientificResearchsGroupId } from '../../../services/scientificResearchService';
import { checkUsernameExist, login } from '../../../services/userService';
import { getscientificResearchUserById, getscientificResearchUserByscientificResearchId } from '../../../services/scientificResearchUserService';
import DeTaiNCKHListRegister from '../../../components/FormListRegister/DeTaiNCKHListRegister';
import DeTaiNCKHDetail from '../../FormDetail/DeTaiNCKHDetail';

const cx = classNames.bind(styles);

const listscientificResearchJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];


function NCKHListTopic({ showModalListTopic, setShowModalListTopic }) {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [showModalListRegister, setShowModalListRegister] = useState(false)
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (showModalListTopic !== open) {
            setOpen(showModalListTopic);
        }
    }, [showModalListTopic]);


    const columns = (showModalUpdate) => [
        {
            title: 'Mã đề tài',
            dataIndex: 'scientificResearchId',
            key: 'scientificResearchId',
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'scientificResearchName',
            key: 'scientificResearchName',
        },
        {
            title: 'Chủ nhiệm đề tài',
            dataIndex: ['instructor', 'fullname'],
            key: 'instructor',
        },
        {
            title: 'SL thành viên',
            dataIndex: 'numberOfMember',
            key: 'numberOfMember',
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
            title: 'SL đăng ký',
            dataIndex: 'numberOfRegister',
            key: 'numberOfRegister',
            align: 'center',
            render: (numberOfRegister, record) =>
                numberOfRegister.length > 0 ? (
                    <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}
                        onClick={() => setShowModalListRegister({
                            ...record,
                            numberOfRegister,
                        })} >
                        Danh sách đăng ký: {numberOfRegister.length}
                    </ButtonCustom >
                ) : (
                    <p style={{ textAlign: 'center' }}>0</p>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnDetail')}
                        leftIcon={<EditOutlined />}
                        outline
                        verysmall
                        onClick={() => setShowModalDetail(record)}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            showModalUpdate(record);
                            setIsUpdate(true);
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
            const result = await getByScientificResearchsGroupId({ scientificResearchGroupId: showModalListTopic.scientificResearchGroupId });
            console.log(result);

            const scientificResearchs = await Promise.all(result.data.data.map(async (data) => {
                // lấy số sinh viên đăng ký
                const numberOfRegister = await getscientificResearchUserByscientificResearchId({ scientificResearch: data.scientificResearchId });
                return {
                    ...data,
                    numberOfRegister: numberOfRegister.data.data || [], // Khởi tạo là mảng trống nếu không có dữ liệu
                };
            }));

            setData(scientificResearchs);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (showModalListTopic !== false) {
            fetchData();
        }
    }, [showModalListTopic]);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <TableCustomAnt
                    height={'350px'}
                    columns={columns(setShowModalUpdate)}
                    data={data}
                    setSelectedRowKeys={setSelectedRowKeys}
                    keyIdChange='scientificResearchId'
                    loading={isLoading}
                />
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia',
            children: (
                <div>
                    {listscientificResearchJoin.map((item, index) => {
                        let color = item.status === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={item.name}
                                extra={
                                    <ButtonCustom primary verysmall to={config.routes.DeTaiNCKHThamGia_Department}>
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.status}
                                </Tag>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];
    const [isToolbar, setIsToolbar] = useState(true);

    //Khi chọn tab 2 (đề tài tham gia) => Ẩn toolbar
    const handleTabClick = (index) => {
        if (index === 2) {
            setIsToolbar(false);
        } else {
            setIsToolbar(true);
        }
    };


    const handleDelete = async () => {
        try {
            for (const id of selectedRowKeys) {
                await deletescientificResearch(id); // Xóa từng thesis
            }
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - khoa luan - deletedThesis] : Error deleting theses:', error);
        }
    };

    // Hàm để đóng modal
    const handleCloseModalListTopic = () => {
        if (showModalListTopic !== false) {
            setShowModalListTopic(false);
        }
    };

    const DeTaiNCKHUpdateMemoized = useMemo(() => {
        return (
            <DeTaiNCKHUpdate
                title={'đề tài nghiên cứu khoa học'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
                groupTopic={showModalListTopic}
            />
        );
    }, [showModalUpdate, isUpdate]);

    const DeTaiNCKHListRegisterMemoized = useMemo(() => {
        return (
            <DeTaiNCKHListRegister
                title={'Danh sách sinh viên đăng ký đề tài'}
                showModal={showModalListRegister}
                setShowModal={setShowModalListRegister}
                changeStatus={setIsChangeStatus}
            />
        );
    }, [showModalListRegister]);

    const DeTaiNCKHDetailMemoized = useMemo(() => (
        <DeTaiNCKHDetail
            title={'Đề tài nghiên cứu khoa học'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    return (
        <>
            <Modal
                className={cx('modal-list-topic')}
                centered
                open={open}
                footer={null}
                onCancel={handleCloseModalListTopic}
                width={"90vw"}
                height={"90vh"}
            >
                <div className={cx('wrapper')}>
                    <div className={cx('conatainer-header')}>
                        <div className={cx('info')}>
                            <span className={cx('icon')}>
                                <ProjectIcon />
                            </span>
                            <h3 className={cx('title')}>Đề tài nghiên cứu khoa học: {showModalListTopic.scientificResearchGroupName}</h3>
                        </div>
                        {isToolbar ? (
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
                        ) : null}
                    </div>

                    <Tabs
                        defaultActiveKey={1} //nếu có đề tài tham gia => set defaultActiveKey = 2
                        centered
                        onTabClick={(index) => handleTabClick(index)}
                        items={ITEM_TABS.map((item, index) => {
                            return {
                                label: item.title,
                                key: index + 1,
                                children: item.children,
                            };
                        })}
                    />
                </div>
            </Modal>
            {DeTaiNCKHUpdateMemoized}
            {DeTaiNCKHListRegisterMemoized}
            {DeTaiNCKHDetailMemoized}
        </>
    );
}

export default NCKHListTopic;
