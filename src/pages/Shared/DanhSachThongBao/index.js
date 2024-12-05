import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachThongBao.module.scss';
import { Divider, Dropdown, Input, List, Select, Skeleton, Space, Switch } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import { deleteConfirm } from '../../../components/Core/Delete';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { deleteNotifications, getWhere, updateNotificationByIds } from '../../../services/notificationService';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import Toolbar from '../../../components/Core/Toolbar';
import { PermissionDetailContext } from '../../../context/PermissionDetailContext';
import config from '../../../config';
import { message } from '../../../hooks/useAntdApp';
import ThongBaoUpdate from '../../../components/FormUpdate/ThongBaoUpdate';
import Button from '../../../components/Core/Button';
import { CheckCircleOutlined, CloseCircleOutlined, DownOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import SearchForm from '../../../components/Core/SearchForm';
import FormItem from '../../../components/Core/FormItem';

const cx = classNames.bind(styles);

function DanhSachThongBao() {
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [originalList, setOriginalList] = useState([]); // Bản sao danh sách ban đầu
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showFilter, setShowFilter] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [isUpdate, setIsUpdate] = useState(false);

    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }
        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const fetchDataNoti = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await getWhere({
                toUsers: [{ userId }],
                createUser: { userId }
            });
            if (res.status === 200) {
                setList(res.data.data);
                setOriginalList(res.data.data); // Lưu bản sao ban đầu
            }
        } catch (error) {
            console.error("Lỗi lấy thông báo: " + error);
        }
        finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDataNoti();
    }, [fetchDataNoti])


    const handleDelete = async (id) => {
        try {
            await deleteNotifications(id);
            // Refresh dữ liệu sau khi xóa thành công
            fetchDataNoti();
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('Error [Nghiep vu - DeTaiNCKH - delete]:', error);
        }
    };

    const ThongBaoUpdatedMemorized = useMemo(() => {
        return (
            <ThongBaoUpdate
                title={'thông báo'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchDataNoti}
            />
        );
    }, [showModalUpdate, isUpdate]);

    // Tạo field cho bộ lọc
    const filterFields = [
        <FormItem
            name="title"
            label="Tiêu đề"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="content"
            label="Nội dung"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="url"
            label="Đường dẫn"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="type"
            label="Loại thông báo"
        >
            <Select>
                <Select.Option value="info">Thông tin</Select.Option>
                <Select.Option value="warning">Cảnh báo</Select.Option>
                <Select.Option value="error">Lỗi</Select.Option>
            </Select>
        </FormItem>,
        <FormItem
            name="createUser"
            label="Người tạo"
        >
            <Input />
        </FormItem>
    ];

    // Hàm tìm kiếm dựa trên danh sách đã có
    const onSearch = (values) => {
        const { title, content, url, type, createUser } = values;

        const filteredList = originalList.filter((item) => {
            const matchesTitle = title ? item.title?.toLowerCase().includes(title.toLowerCase()) : true;
            const matchesContent = content ? item.content?.toLowerCase().includes(content.toLowerCase()) : true;
            const matchesUrl = url ? item.url?.toLowerCase().includes(url.toLowerCase()) : true;
            const matchesType = type ? item.type === type : true;
            const matchesCreateUser = createUser
                ? item.createUser && ( // Kiểm tra nếu createUser tồn tại
                    (item.createUser.fullname?.toLowerCase().includes(createUser.toLowerCase())) || // So khớp fullname
                    (item.createUser.userId?.toLowerCase().includes(createUser.toLowerCase()))     // So khớp userId
                )
                : true; // Nếu không có createUser, mặc định trả về true

            return matchesTitle && matchesContent && matchesUrl && matchesType && matchesCreateUser;
        });

        setList(filteredList);
    };


    const getItemsAction = (item) => {
        const actions = [];

        // Hành động "Sửa" chỉ hiện nếu có quyền isEdit
        if (permissionDetailData?.isEdit) {
            actions.push({
                label: (
                    <div
                        onClick={() => {
                            setIsUpdate(true);
                            setShowModalUpdate(item);
                        }}
                    >
                        Sửa
                    </div>
                ),
                key: '0',
            });
        }

        // Hành động "Xóa" chỉ hiện nếu có quyền isDelete
        if (permissionDetailData?.isDelete) {
            actions.push({
                label: (
                    <div onClick={() => deleteConfirm('thông báo', () => handleDelete(item.id))}>
                        Xóa
                    </div>
                ),
                key: '1',
            });
        }

        return actions;
    };


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Danh sách thông báo</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }}
                    />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModalUpdate(true);
                            setIsUpdate(false);
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                </div>
            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={filterFields}
                    onSearch={onSearch}
                    onReset={() => { fetchDataNoti() }}
                />
                <Divider />
            </div>
            <Skeleton avatar title={false} loading={isLoading} active>
                <List
                    pagination={{
                        position: 'bottom',
                        align: 'end',
                        onChange: (page) => setCurrentPage(page), // Lưu số trang hiện tại
                        pageSize: pageSize, // Số mục trong một trang
                    }}
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item
                            key={item.id}
                            actions={
                                item.isSystem && item.createUser.userId === userId && (permissionDetailData?.Edit || permissionDetailData?.Delete)
                                && [
                                    <Dropdown
                                        menu={{
                                            items: getItemsAction(item),
                                        }}
                                        trigger={['click']}
                                    >
                                        <Button primary verysmall>
                                            <Space>
                                                Thực hiện
                                                <DownOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>
                                ]}
                        >

                            <List.Item.Meta
                                avatar={
                                    <h2 className={cx('stt')}>
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </h2>
                                }
                                title={<div className={cx('name')} onClick={() => { navigate(item.url) }}>{item.title}</div>}
                                description={
                                    <div>
                                        <p>Nội dung: {item.content}</p>
                                        <p>Người tạo: {item.createUser.userId} - {item.createUser.fullname}</p>
                                        <p>Hiển thị:
                                            <Switch
                                                style={{ marginLeft: "10px" }}
                                                disabled={
                                                    (
                                                        item.isSystem &&
                                                        item.createUser.userId === userId
                                                    )
                                                        ? permissionDetailData?.isEdit
                                                            ? false
                                                            : true
                                                        : true
                                                }
                                                checked={!item.disabled} // Hiển thị "true" nếu `disabled` là `false`
                                                onChange={async (checked) => {
                                                    try {
                                                        // Cập nhật danh sách ngay lập tức
                                                        setList((prevList) =>
                                                            prevList.map((i) =>
                                                                i.id === item.id ? { ...i, disabled: !checked } : i
                                                            )
                                                        );

                                                        // Gửi yêu cầu cập nhật trạng thái "disabled"
                                                        await updateNotificationByIds(item.id, { disabled: !checked });
                                                        message.success(checked ? `Hiển thị thành công` : `Ẩn thành công`);
                                                    } catch (error) {
                                                        console.error("Lỗi khi cập nhật trạng thái hiển thị:", error);

                                                        // Khôi phục trạng thái cũ nếu API thất bại
                                                        setList((prevList) =>
                                                            prevList.map((i) =>
                                                                i.id === item.id ? { ...i, disabled: checked } : i
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </p>
                                    </div>
                                }
                            />
                            <div
                                className={cx('container-deadline-register')}
                                style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                            >
                                <div className={cx(`item-type`)}>
                                    {item.type === 'success' ? (
                                        <CheckCircleOutlined
                                            style={{ color: '#52c41a', background: 'var(--color-bg-title)', borderRadius: '50%' }}
                                        />
                                    ) : item.type === 'warning' ? (
                                        <ExclamationCircleOutlined
                                            style={{ color: '#faad14', background: '#fffbe6', borderRadius: '50%' }}
                                        />
                                    ) : item.type === 'error' ? (
                                        <CloseCircleOutlined
                                            style={{ color: '#ff4d4f', background: '#fff2f0', borderRadius: '50%' }}
                                        />
                                    ) : item.type === 'info' ? (
                                        <InfoCircleOutlined
                                            style={{ color: '#1890ff', background: '#e6f7ff', borderRadius: '50%' }}
                                        />
                                    ) : null}
                                </div>
                                <p style={{ marginRight: '10px' }}>Ngày tạo: {item.createDate && dayjs(item.createDate).format('DD/MM/YYYY HH:mm:ss')}</p>
                            </div>

                        </List.Item>
                    )}
                />
            </Skeleton>
            {ThongBaoUpdatedMemorized}
        </div>
    );
}

export default DanhSachThongBao;
