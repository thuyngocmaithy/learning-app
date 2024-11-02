import classNames from 'classnames/bind';
import styles from './NguoiDung.module.scss';
import { message, Tag } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import NguoiDungUpdate from '../../../../components/FormUpdate/NguoiDungUpdate';
import { deleteUserById } from '../../../../services/userService';
import { getAllUser } from '../../../../services/userService';

const cx = classNames.bind(styles);

function NguoiDung() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);

    const columns = (showModal) => [
        {
            title: 'Mã người dùng',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'Chức danh',
            dataIndex: 'isStudent',
            key: 'isStudent',
            render: (_, record) => {
                return (
                    record.isStudent === true
                        ? <Tag color='green'>Sinh viên</Tag>
                        : <Tag color='red'>Giảng viên</Tag>
                )
            },
        },
        {
            title: 'Ngành',
            dataIndex: ['faculty', 'facultyName'],
            key: 'facultyName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: ['major', 'majorName'],
            key: 'majorName',
        },
        {
            title: 'Năm học',
            dataIndex: 'firstAcademicYear',
            key: 'firstAcademicYear',
        },
        {
            title: 'Năm kết thúc',
            dataIndex: 'lastAcademicYear',
            key: 'lastAcademicYear',
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
                            setShowModal(record);
                            setIsUpdate(true);
                            setViewOnly(true)
                            setShowModalDetail(true);
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

    const fetchData = async () => {
        try {
            const result = await getAllUser();

            let listUser = result.data.map(user => ({
                userId: user.userId,
                fullname: user.fullname,
                dateOfBirth: user.dateOfBirth,
                placeOfBirth: user.placeOfBirth,
                phone: user.phone,
                email: user.email,
                isStudent: user.isStudent,
                class: user.class || "",
                faculty: user.faculty ? {
                    facultyId: user.faculty.facultyId,
                    facultyName: user.faculty.facultyName
                } : null,
                major: user.major ? {
                    majorId: user.major.majorId,
                    majorName: user.major.majorName
                } : null,
                stillStudy: user.stillStudy,
                firstAcademicYear: user.firstAcademicYear,
                lastAcademicYear: user.lastAcademicYear,
                nien_khoa: user.nien_khoa || "",
                sex: user.sex || "",
                dan_toc: user.dan_toc || "",
                ton_giao: user.ton_giao || "",
                quoc_tich: user.quoc_tich || "",
                cccd: user.cccd || "",
                ho_khau_thuong_tru: user.ho_khau_thuong_tru || "",
                khu_vuc: user.khu_vuc || "",
                khoi: user.khoi || "",
                bac_he_dao_tao: user.bac_he_dao_tao || "",
                ma_cvht: user.ma_cvht || "",
                ho_ten_cvht: user.ho_ten_cvht || "",
                email_cvht: user.email_cvht || "",
                dien_thoai_cvht: user.dien_thoai_cvht || "",
                ma_cvht_ng2: user.ma_cvht_ng2 || "",
                ho_ten_cvht_ng2: user.ho_ten_cvht_ng2 || "",
                email_cvht_ng2: user.email_cvht_ng2 || "",
                dien_thoai_cvht_ng2: user.dien_thoai_cvht_ng2 || "",
                ma_truong: user.ma_truong || "",
                ten_truong: user.ten_truong || "",
                hoc_vi: user.hoc_vi || "",
                isActive: user.isActive,
                avatar: user.avatar || "",
                permission: user.permission || null,
            }));

            setData(listUser);
            console.log(listUser);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
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
            // Gọi API để xóa các user theo ID
            await deleteUserById({ ids: selectedRowKeys.join(',') }); // Chuyển đổi mảng ID thành chuỗi
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - NguoiDung - deletedAccount] : Error deleting account:', error);
        }
    };



    const NguoiDungUpdateMemoized = useMemo(() => {
        return (
            <NguoiDungUpdate
                title={'người dùng'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
                viewOnly={viewOnly}
            />
        );
    }, [showModal, isUpdate]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Người dùng</h3>
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
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('người dùng', handleDelete)} />
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
                keyIdChange="userId"
            />
            {NguoiDungUpdateMemoized}

        </div>
    );
}

export default NguoiDung;
