import classNames from 'classnames/bind';
import styles from './DeTaiKhoaLuanThamGia.module.scss';
import { Breadcrumb, Spin, Tabs } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { Link, useLocation } from 'react-router-dom';
import ChatBox from '../../../components/Core/ChatBox';
import ThongTinDeTaiKhoaLuanThamGia from '../../../components/ThongTinDeTaiKhoaLuanThamGia';
import Attach from '../../../components/Core/Attach';
import System from '../../../components/Core/System';
import { useNavigate } from 'react-router-dom';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { getThesisById } from '../../../services/thesisService';
import { uploadFile, downloadFile, deleteFiles } from '../../../services/megaService';
import config from '../../../config';
import Toolbar from '../../../components/Core/Toolbar';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getWhere } from '../../../services/attachService';
import { ProjectIcon } from '../../../assets/icons';
import dayjs from 'dayjs';
import { PermissionDetailContext } from '../../../context/PermissionDetailContext';
import { useConfirm } from '../../../hooks/useConfirm';


const cx = classNames.bind(styles);

function DeTaiKhoaLuanThamGia() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const { userId, permission } = useContext(AccountLoginContext);
    const queryParams = new URLSearchParams(location.search);
    const ThesisIdFromUrl = queryParams.get('thesis');
    const ThesisGroupIdFromUrl = queryParams.get('ThesisGroup');
    const isAll = queryParams.get('all');
    const [isLoading, setIsLoading] = useState(true);
    const [thesis, setThesis] = useState(null);
    const [dataFollower, setDataFollower] = useState([])
    const [dataAttach, setDataAttach] = useState([])
    const fileInputRef = useRef(null);
    const [loadingFiles, setLoadingFiles] = useState({}); // Trạng thái loading cho từng file
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    // Xử lý active tab từ url
    const [isToolbar, setIsToolbar] = useState(false);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);

    useEffect(() => {
        // Lấy tabIndex từ URL nếu có
        function getInitialTabIndex() {
            const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
            setTabActive(tab);
        }
        getInitialTabIndex();
    }, [tabIndexFromUrl])

    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);

        // Kiểm tra nếu tabIndex chưa có trong URL thì thêm mới
        if (!params.has('tabIndex')) {
            params.append('tabIndex', tabId);
        } else {
            params.set('tabIndex', tabId); // Cập nhật giá trị mới cho tabIndex nếu đã có
        }

        // Cập nhật URL với params mới
        navigate(`${currentUrl.pathname}?${params.toString()}`);
    };

    //Khi chọn tab 2 (đề tài tham gia) => Ẩn toolbar
    const handleTabClick = (index) => {
        setTabActive(index)
        if (index === 3) {
            setIsToolbar(true);
        } else {
            setIsToolbar(false);
        }
    };

    useEffect(() => {
        if (tabActive === 3) {
            setIsToolbar(true);
        } else {
            setIsToolbar(false);
        }
    }, [tabActive])

    const getInfothesis = useCallback(async () => {
        if (ThesisIdFromUrl) {
            try {

                const responsethesisUser = await getThesisById(ThesisIdFromUrl);
                if (responsethesisUser.status === "success") {

                    setThesis(responsethesisUser.data)
                    setDataFollower(responsethesisUser.data?.follower[0]?.followerDetails)
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin đề tài" + error);
            }
        }
    }, [ThesisIdFromUrl]);

    const getAttach = useCallback(async () => {
        if (ThesisIdFromUrl) {
            try {

                const response = await getWhere({ thesisId: ThesisIdFromUrl });
                if (response.status === 200) {
                    const dataAttach = response.data.data.map((data, index) => {
                        return {
                            id: data.id,
                            filename: data.filename,
                            createDate: dayjs(data.createDate).format('DD/MM/YYYY HH:mm'),
                            createUserName: data.createUser.fullname,
                            createUser: data.createUser.userId,
                        }
                    })
                    setDataAttach(dataAttach)
                }

            } catch (error) {
                console.error("Lỗi lấy file đính kèm" + error);
            }
        }
    }, [ThesisIdFromUrl]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Bắt đầu quá trình load

            try {
                await Promise.all([getInfothesis(), getAttach()]); // Đợi cả 2 function hoàn thành
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu: " + error);
            } finally {
                setIsLoading(false);
            }
        };

        if (ThesisIdFromUrl) {
            fetchData();
        }
    }, [ThesisIdFromUrl, getAttach, getInfothesis]);



    // Hàm để xử lý upload file
    const handleUpload = async (files) => {

        if (files.length === 0) {
            message.warning('Vui lòng chọn file đính kèm'); // Kiểm tra xem có file đã chọn hay không
            return;
        }
        const loadingMessage = message.loading('Đang tải tệp lên', 0);
        try {
            await uploadFile(files, userId, null, ThesisIdFromUrl); // Gọi hàm upload file
            message.success('File đã được tải lên thành công');
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Tải file lên thất bại.');
        } finally {
            loadingMessage();
            getAttach();
        }
    };

    // Hàm xử lý download file
    const handleDownload = async (file) => {
        setLoadingFiles(prev => ({ ...prev, [file]: true })); // Bắt đầu tải file cho file cụ thể
        try {
            await downloadFile(file); // Gọi hàm download file            
        } catch (error) {
            message.error("Không tìm thấy file");
        } finally {
            setLoadingFiles(prev => ({ ...prev, [file]: false })); // Kết thúc tải file cho file cụ thể
        }
    }

    // Hàm xóa file
    const handleDelete = async () => {
        const loadingMessage = message.loading('Tệp đang được xóa', 0);
        try {
            await deleteFiles(selectedRowKeys);
            message.success('Xóa tệp thành công');
        } catch (error) {
            message.error('Không thể xóa tệp');
            console.error('Lỗi khi xóa tệp:', error);
        }
        finally {
            loadingMessage();
            getAttach();
        }
    };

    const dataInfoSystem = useMemo(() => [
        { title: 'Người tạo', description: thesis ? thesis.createUser.fullname : '' },
        { title: 'Ngày tạo', description: thesis ? format(thesis.createDate, 'dd/MM/yyyy HH:mm:ss') : '' },
        {
            title: 'Người chỉnh sửa', description: thesis ?
                thesis.lastModifyUser ?
                    thesis.lastModifyUser.fullname :
                    thesis.createUser.fullname
                : ''
        },
        { title: 'Ngày chỉnh sửa', description: thesis ? format(thesis.lastModifyDate, 'dd/MM/yyyy HH:mm:ss') : '' },
    ], [thesis]);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
        },
        {
            title: 'File đính kèm',
            dataIndex: 'filename',
            key: 'filename',
            render: (_, { filename }) => (
                <div className='container-link-file' onClick={() => handleDownload(filename)}>
                    <span className={cx('link-file')} key={filename} style={{ textDecoration: 'underline' }}>
                        {filename}
                    </span>
                    <Spin spinning={loadingFiles[filename] !== undefined && loadingFiles[filename]} />
                </div>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'createDate',
            key: 'createDate',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.createDate - b.createDate,
        },
        {
            title: 'Người đính kèm',
            key: 'createUserName',
            dataIndex: 'createUserName',
        },
    ];

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Chi tiết',
            children: <ThongTinDeTaiKhoaLuanThamGia thesis={thesis} />,
        },
        {
            id: 2,
            title: 'Thảo luận',
            children: <ChatBox />,
        },
        {
            id: 3,
            title: 'Đính kèm',
            children:
                <Attach
                    columns={columns}
                    data={dataAttach}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                />,
        },
        {
            id: 4,
            title: 'Hệ thống',
            children: <System dataInfoSystem={dataInfoSystem} dataFollower={dataFollower} reLoad={getInfothesis} />,
        },
    ];

    const urlKhoaLuan = () => {
        if (permission !== "SINHVIEN") {
            if (ThesisGroupIdFromUrl) {
                return `${config.routes.DeTaiKhoaLuan_Department}?ThesisGroupId=${ThesisGroupIdFromUrl}`
            }
            else {
                return `${config.routes.DeTaiKhoaLuan_Department}?tabIndex=2`
            }

        }
        else {
            if (ThesisGroupIdFromUrl) {
                return `${config.routes.DeTaiKhoaLuan}?ThesisGroupId=${ThesisGroupIdFromUrl}`
            }
            else {
                return `${config.routes.DeTaiKhoaLuan}?tabIndex=2`
            }
        }

    }



    return isLoading ? (
        <div className={cx('container-loading')}>
            <Spin size="large" />
        </div>
    ) : (
        < div className={cx('wrapper-DeTaiKhoaLuanThamGia')} >
            <Breadcrumb
                className={cx('breadcrumb')}
                items={isAll !== "true" ?
                    [
                        // Kiểm tra nếu urlPrevious từ NhomDeTaiKhoaLuan thì mới hiển thị
                        ...(ThesisGroupIdFromUrl
                            ? [
                                {
                                    title: <Link
                                        to={
                                            permission === "SINHVIEN"
                                                ? config.routes.NhomDeTaiKhoaLuan
                                                : config.routes.NhomDeTaiKhoaLuan_Department
                                        }>
                                        Nhóm đề tài khóa luận
                                    </Link>,
                                }
                            ] : []),
                        {
                            title: <span
                                className={cx('breadcrumb-item')}
                                onClick={() => {
                                    const url = urlKhoaLuan();
                                    navigate(url);
                                }}
                            >
                                Danh sách đề tài khóa luận
                            </span>,
                        },
                        {
                            title: "Thông tin đề tài khóa luận",
                        },

                    ]
                    :
                    [
                        {
                            title: <Link to={
                                permission === "SINHVIEN"
                                    ? config.routes.NhomDeTaiKhoaLuan
                                    : config.routes.NhomDeTaiKhoaLuan_Department
                            } >
                                Nhóm đề tài khóa luận
                            </Link>,
                        },
                        {
                            title: "Thông tin đề tài khóa luận",
                        },
                    ]
                }
            />
            <div className={cx('container-header')} >
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>
                        Thông tin đề tài khóa luận
                    </h3>
                </div>
                {isToolbar && (
                    <div className={cx('wrapper-toolbar')}>
                        <Toolbar
                            type={'Xóa'}
                            onClick={() => deleteConfirm('tệp đính kèm', handleDelete)}
                        />
                        <Toolbar
                            type={'Upload'}
                            onClick={handleUpload}
                            fileInputRef={fileInputRef}
                            isVisible={permissionDetailData?.isAdd}
                        />
                    </div>
                )}
            </div >
            <Tabs
                activeKey={tabActive}
                onChange={handleTabChange}
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
        </div >
    );
}

export default DeTaiKhoaLuanThamGia;

