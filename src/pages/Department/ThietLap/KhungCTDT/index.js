import classNames from 'classnames/bind';
import styles from './KhungCTDT.module.scss';
import { message } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import KhungCTDTUpdate from '../../../../components/FormUpdate/KhungCTDTUpdate';
import { deleteStudyFrameComponents } from '../../../../services/studyFrameCompService';
import { getAll } from '../../../../services/studyFrameService';
import DungKhungCTDTUpdate from '../../../../components/FormUpdate/DungKhungCTDTUpdate';

const cx = classNames.bind(styles);

function KhungCTDT() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [showModalBuildFrame, setShowModalBuildFrame] = useState(false); // hiển thị model dựng khung
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    const columns = (showModal) => [
        {
            title: 'Mã khung đào tạo',
            dataIndex: 'frameId',
            key: 'frameId',
            width: '170px',
        },
        {
            title: 'Tên khung đào tạo',
            dataIndex: 'frameName',
            key: 'frameName',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '450px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnStructure')}
                        leftIcon={<EditOutlined />}
                        outline
                        verysmall
                        onClick={() => {
                            setShowModalBuildFrame(record);
                        }}
                    >
                        Xây dựng khung
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnApply')}
                        leftIcon={<EditOutlined />}
                        outline
                        colorRed
                        verysmall
                        onClick={() => {
                            // showModal(record);
                        }}
                    >
                        Áp dụng khung
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            showModal(record);
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
            const result = await getAll();
            if (result.status === 200) {
                setData(result.data.data);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleDelete = async () => {
        try {
            await deleteStudyFrameComponents(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - KhungCTDT - handleDelete - Error]:', error);
        }
    };


    const khungCTDTUpdateMemoized = useMemo(() => {
        return (
            <KhungCTDTUpdate
                title={'khung đào tạo'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    const dungKhungCTDTMemoized = useMemo(() => {
        return (
            <DungKhungCTDTUpdate
                title={'Dựng khung đào tạo'}
                showModal={showModalBuildFrame}
                setShowModal={setShowModalBuildFrame}
            // reLoad={fetchData}
            />
        );
    }, [showModalBuildFrame]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Khung chương trình đào tạo</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('thành phần khung đào tạo', handleDelete)} />
                </div>

            </div>
            <TableCustomAnt
                height={'350px'}
                columns={columns(setShowModal)}
                data={data}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange={"frameId"}
            />
            {khungCTDTUpdateMemoized}
            {dungKhungCTDTMemoized}

        </div>
    );
}

export default KhungCTDT;
