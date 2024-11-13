import classNames from 'classnames/bind';
import styles from './MonHoc.module.scss';
import { message, Tag } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { deleteSubjectById, getAllSubjectDetail } from '../../../../services/subjectService';
import MonHocUpdate from '../../../../components/FormUpdate/MonHocUpdate';
import { MonHocDetail } from '../../../../components/FormDetail/MonHocDetail';

const cx = classNames.bind(styles);

function MonHoc() {

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);

    const fetchData = async () => {
        try {
            const result = await getAllSubjectDetail();
            console.log(result);


            let listSubject = Array.isArray(result.data[0])
                ? result.data[0].map(subject => ({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    creditHour: subject.creditHour,
                    isCompulsory: subject.isCompulsory,
                    createDate: subject.createDate,
                    lastModifyDate: subject.lastModifyDate,
                    createUserId: subject.createUserId,
                    lastModifyUserId: subject.lastModifyUserId,
                    subjectBefore: subject.subjectBefore,
                    majorId: subject.majorId,
                    majorName: subject.majorName,
                    facultyId: subject.facultyId,
                    facultyName: subject.facultyName,
                    frameComponentId: subject.frameComponentId,
                    frameComponentName: subject.frameComponentName,
                    frameDescription: subject.description

                }))
                : []; // Hoặc xử lý khác nếu data không phải là mảng

            setData(listSubject);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(true);
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
            await deleteSubjectById({ ids: selectedRowKeys.join(',') });
            fetchData();
            setSelectedRowKeys([]);
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - MonHoc - deletedSubject] : Error deleting subject:', error);
        }
    };

    const MonHocUpdateMemorized = useMemo(() => {
        return (
            <MonHocUpdate
                title={'Môn học'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
                viewOnly={viewOnly}
            />
        );
    }, [showModal, isUpdate]);


    const MonHocDetailMemoized = useMemo(() => (
        <MonHocDetail
            title={'môn học'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const columns = (showModal) => [
        {
            title: 'Mã môn học',
            dataIndex: 'subjectId',
            key: 'subjectId',
        },
        {
            title: 'Tên môn',
            dataIndex: 'subjectName',
            key: 'subjectName',
        },
        {
            title: 'Bắt buộc',
            dataIndex: 'isCompulsory',
            key: 'isCompulsory',
            render: (_, record) => {
                return (
                    record.isCompulsory === 1
                        ? <Tag color='green'>Có</Tag>
                        : <Tag color='red'>Không</Tag>
                )
            },
        },
        {
            title: 'Khoa - Ngành',
            dataIndex: 'facultyName',
            key: 'facultyName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Mã môn trước',
            dataIndex: 'subjectBefore',
            key: 'subjectBefore',
        },
        {
            title: 'Khung môn học',
            dataIndex: 'frameComponentName',
            key: 'frameComponentName',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '130px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnDetail')}
                        leftIcon={<EyeOutlined />}
                        outline
                        verysmall
                        onClick={() => {
                            setShowModalDetail(record);
                        }}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setShowModal(record);
                            setIsUpdate(true);
                            setViewOnly(false);
                            setShowModalDetail(false);
                        }}>
                        Sửa
                    </ButtonCustom>
                </div>
            )
            ,
        }
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Môn học</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                            setViewOnly(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('môn học', handleDelete)} />
                    <Toolbar type={'Nhập file Excel'} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>

            </div>
            <TableCustomAnt
                height={'600px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange="subjectId"
            />
            {MonHocUpdateMemorized}
            {MonHocDetailMemoized}
        </div>
    );
}

export default MonHoc;
