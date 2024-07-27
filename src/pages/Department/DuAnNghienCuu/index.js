import classNames from 'classnames/bind';
import styles from './DuAnNghienCuu.module.scss';
import { Card, Input, InputNumber, Select, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../assets/icons';
import { useEffect, useState } from 'react';
import ButtonCustom from '../../../components/Core/Button';
import config from '../../../config';
import TableCustomAnt from '../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../components/Core/Delete';
import Update from '../../../components/Core/Update';
import FormItem from '../../../components/Core/FormItem';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const listProject = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', count: 4, deadline: '10/05/2024' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        count: 1,
        deadline: '15/07/2024',
    },
    {
        id: '3',
        name: 'Ứng dụng công nghệ Blockchain trong kiểm chứng hồ sơ xin việc',
        count: 2,
        deadline: '12/06/2024',
    },
    {
        id: '4',
        name: 'Khảo sát một số thuật toán metaheuristic giải bài toán cây steiner nhỏ nhất trong trường hợp đồ thị thưa',
        count: 0,
        deadline: '03/05/2024',
    },
    {
        id: '5',
        name: 'Mô hình phát hiện tắc nghẽn với các tham số động trên mạng cảm biến không dây',
        count: 10,
        deadline: '09/09/2024',
    },
    { id: '6', name: 'Dự đoán ung thư phổi trên ảnh CT bằng phương pháp học sâu', count: 5, deadline: '30/12/2024' },
];
const listProjectJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];

const columns = (showModalUpdated) => [
    {
        title: 'Mã dự án',
        dataIndex: 'MaDA',
        key: 'MaDA',
    },
    {
        title: 'Tên đề tài',
        dataIndex: 'TenDeTai',
        key: 'TenDeTai',
    },
    {
        title: 'Khoa',
        dataIndex: 'Khoa',
        key: 'Khoa',
    },
    {
        title: 'Chủ nhiệm đề tài',
        dataIndex: 'CNDeTai',
        key: 'CNDeTai',
    },
    {
        title: 'SL thành viên',
        dataIndex: 'SL',
        key: 'SL',
    },
    {
        title: 'Trạng thái',
        key: 'Status',
        dataIndex: 'Status',
        render: (_, { Status }) => (
            <>
                {Status.map((tag) => {
                    let color = tag === 'Đang thực hiện' ? 'green' : 'red';
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
        filters: [
            {
                text: 'Đang thực hiện',
                value: 'Đang thực hiện',
            },
            {
                text: 'Chưa thực hiện',
                value: 'Chưa thực hiện',
            },
        ],
        onFilter: (value, record) => record.Status.indexOf(value) === 0,
    },
    {
        title: 'SL đăng ký',
        dataIndex: 'SLDK',
        key: 'SLDK',
        render: (sldk) =>
            parseInt(sldk) > 0 ? (
                <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}>
                    Danh sách đăng ký: {sldk}
                </ButtonCustom>
            ) : (
                <p style={{ textAlign: 'center' }}>0</p>
            ),
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <div className={cx('action-item-nh')}>
                <ButtonCustom className={cx('btnDetail')} leftIcon={<EditOutlined />} outline verysmall>
                    Chi tiết
                </ButtonCustom>
                <ButtonCustom
                    className={cx('btnEdit')}
                    leftIcon={<EditOutlined />}
                    primary
                    verysmall
                    onClick={() => showModalUpdated(record.NH)}
                >
                    Sửa
                </ButtonCustom>
            </div>
        ),
    },
];

const data = [
    {
        key: '1',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 0,
    },
    {
        key: '2',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 2,
    },
    {
        key: '3',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Đang thực hiện'],
        SLDK: 0,
    },
    {
        key: '4',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 1,
    },
    {
        key: '5',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 3,
    },
    {
        key: '6',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 10,
    },
    {
        key: '7',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 12,
    },
    {
        key: '8',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 3,
    },
    {
        key: '9',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 6,
    },
    {
        key: '10',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 9,
    },
];

function DuAnNghienCuu() {
    const [showModalAdd, setShowModalAdd] = useState(false); //hiển thị model add
    const [showModalUpdated, setShowModalUpdated] = useState(false); // hiển thị model updated

    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    useEffect(() => {
        setList(listProject);
        setIsLoading(false);
    }, []);

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModalAdd) {
            setShowModalAdd(false);
        }
        if (showModalUpdated) {
            setShowModalUpdated(false);
        }
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách dự án',
            children: (
                <TableCustomAnt
                    height={'350px'}
                    columns={columns}
                    data={data}
                    showModalUpdated={() => setShowModalUpdated(true)}
                />
            ),
        },
        {
            id: 2,
            title: 'Dự án tham gia',
            children: (
                <div>
                    {listProjectJoin.map((item, index) => {
                        let color = item.status === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-duanthamgia')}
                                key={index}
                                type="inner"
                                title={item.name}
                                extra={
                                    <ButtonCustom primary verysmall to={config.routes.DuAnThamGia_Department}>
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

    //Khi chọn tab 2 (Dự án tham gia) => Ẩn toolbar
    const handleTabClick = (index) => {
        if (index === 2) {
            setIsToolbar(false);
        } else {
            setIsToolbar(true);
        }
    };

    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ResearchProjectsIcon />
                    </span>
                    <h3 className={cx('title')}>Dự án nghiên cứu</h3>
                </div>
                {/* Truyền hàm setShowModalAdd vào Toolbar */}
                {isToolbar ? (
                    <div className={cx('wrapper')}>
                        <Toolbar type={'add'} onClick={() => setShowModalAdd(true)} />
                        <Toolbar type={'delete'} onClick={() => showDeleteConfirm('năm học')} />
                        <Toolbar type={'import'} />
                        <Toolbar type={'export'} />
                    </div>
                ) : null}
            </div>

            <Tabs
                defaultActiveKey={1} //nếu có dự án tham gia => set defaultActiveKey = 2
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
            <Update
                title={'dự án nghiên cứu'}
                showModalAdd={showModalAdd}
                showModalUpdated={showModalUpdated}
                onClose={handleCloseModal}
            >
                <FormItem label={'Tên đề tài'}>
                    <Input />
                </FormItem>
                <FormItem label={'Khoa'}>
                    <Select
                        onChange={handleChange}
                        options={[
                            {
                                value: 'CNTT',
                                label: 'CNTT',
                            },
                            {
                                value: 'Kế toán',
                                label: 'Kế toán',
                            },
                            {
                                value: 'Tài chính - ngân hàng',
                                label: 'Tài chính - ngân hàng',
                            },
                        ]}
                    />
                </FormItem>
                <FormItem label={'Chủ nhiệm đề tài'}>
                    <Input />
                </FormItem>
                <FormItem label={'Số lượng thành viên'}>
                    <InputNumber style={{ width: '100%' }} min={1} max={10} step={1} />
                </FormItem>
            </Update>
        </div>
    );
}

export default DuAnNghienCuu;
