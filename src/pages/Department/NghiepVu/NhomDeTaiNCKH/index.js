import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Card, message, Tabs, Tag } from 'antd';
import { ListCourseIcon, ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import NhomDeTaiNCKHUpdate from '../../../../components/FormUpdate/NhomDeTaiNCKHUpdate';
import { deleteScientificResearchGroups, getAllSRGroup } from '../../../../services/scientificResearchGroupService';
import config from '../../../../config';
import { getSRUByUserIdAndSRGId } from '../../../../services/scientificResearchUserService';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';

const cx = classNames.bind(styles);


function NhomDeTaiNCKH() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [showModalListTopic, setShowModalListTopic] = useState(false); // hiển thị model list topic
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [listScientificResearchJoined, setListscientificResearchJoined] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isToolbar, setIsToolbar] = useState(true);

    // HANDLE TAB
    //Khi chọn tab 2 (đề tài tham gia) => Ẩn toolbar
    const handleTabClick = (index) => {
        if (index === 2) {
            setIsToolbar(false);
        } else {
            setIsToolbar(true);
        }
    };

    // =================
    const columns = () => [
        {
            title: 'Mã nhóm đề tài',
            dataIndex: 'scientificResearchGroupId',
            key: 'scientificResearchGroupId',
        },
        {
            title: 'Tên nhóm đề tài',
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
                    <ButtonCustom className={cx('btnDetail')} outline verysmall to={`${config.routes.DeTaiNCKH_Department}?SRGId=${record.scientificResearchGroupId}`}>
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
            const result = await getAllSRGroup()
            setData(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false)
        }
    };

    const listRegisterscientificResearchJoined = async () => {
        try {
            const response = await getSRUByUserIdAndSRGId({ userId: userId });

            if (response.status === 200) {
                setListscientificResearchJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        listRegisterscientificResearchJoined();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);


    const handleDelete = async () => {
        try {
            await deleteScientificResearchGroups(selectedRowKeys);
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - NhomDeTaiNCKH_Department - deleted] - Error', error);
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

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Nhóm đề tài NCKH',
            children: (
                <TableCustomAnt
                    height={'350px'}
                    columns={columns(setShowModalUpdate)}
                    data={data}
                    setSelectedRowKeys={setSelectedRowKeys}
                    keyIdChange='scientificResearchGroupId'
                    loading={isLoading}
                />
            ),
        },
        {
            id: 2,
            title: 'Tất cả đề tài tham gia',
            children: (
                <div>
                    {listScientificResearchJoined.map((item, index) => {
                        let color = item.scientificResearch.status.statusName === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={item.scientificResearch.scientificResearchName}
                                extra={
                                    <ButtonCustom primary verysmall to={`${config.routes.DeTaiNCKHThamGia_Department}?scientificResearch=${item.scientificResearch.scientificResearchId}`}>
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.scientificResearch.status.statusName}
                                </Tag>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (

        <div className={cx('wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài NCKH</h3>
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
                defaultActiveKey={1}
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




            {NhomDeTaiNCKHUpdateMemoized}
        </div>
    );
}

export default NhomDeTaiNCKH;
