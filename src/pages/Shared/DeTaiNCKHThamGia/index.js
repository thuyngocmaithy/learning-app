import classNames from 'classnames/bind';
import styles from './DeTaiNCKHThamGia.module.scss';
import { Breadcrumb, Spin, Tabs } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { Link, useLocation } from 'react-router-dom';
import ChatBox from '../../../components/Core/ChatBox';
import ThongTinDeTaiNCKHThamGia from '../../../components/ThongTinDeTaiNCKHThamGia';
import Attach from '../../../components/Core/Attach';
import System from '../../../components/Core/System';
import { useNavigate } from 'react-router-dom';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { getSRById } from '../../../services/scientificResearchService';
import { uploadFile, downloadFile } from '../../../services/megaService';
import config from '../../../config';
import Toolbar from '../../../components/Core/Toolbar';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getWhere } from '../../../services/attachService';
import { ProjectIcon } from '../../../assets/icons';
import dayjs from 'dayjs';
import { PermissionDetailContext } from '../../../context/PermissionDetailContext';

const cx = classNames.bind(styles);

function DeTaiNCKHThamGia() {
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const { userId, permission } = useContext(AccountLoginContext);
    const queryParams = new URLSearchParams(location.search);
    const SRIdFromUrl = queryParams.get('scientificResearch');
    const SRGIdFromUrl = queryParams.get('SRG');
    const isAll = queryParams.get('all');
    const [isLoading, setIsLoading] = useState(true);
    const [scientificResearch, setScientificResearch] = useState(null);
    const [dataFollower, setDataFollower] = useState([])
    const [dataAttach, setDataAttach] = useState([])
    const fileInputRef = useRef(null);
    const [loadingFiles, setLoadingFiles] = useState({}); // Trạng thái loading cho từng file
    const navigate = useNavigate();

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

    const getInfoscientificResearch = useCallback(async () => {
        try {
            if (SRIdFromUrl) {
                const responsescientificResearchUser = await getSRById(SRIdFromUrl);
                if (responsescientificResearchUser.status === "success") {
                    setScientificResearch(responsescientificResearchUser.data)

                    setDataFollower(responsescientificResearchUser.data?.follower[0]?.followerDetails)
                }
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin đề tài" + error);
        }
    }, [SRIdFromUrl]);

    const getAttach = useCallback(async () => {
        try {
            if (SRIdFromUrl) {
                const response = await getWhere({ SRId: SRIdFromUrl });
                if (response.status === 200) {
                    const dataAttach = response.data.data.map((data, index) => {
                        return {
                            id: data.id,
                            filename: data.filename,
                            createDate: dayjs(data.createDate).format('DD/MM/YYYY HH:mm'),
                            createUser: data.createUser.fullname
                        }
                    })
                    setDataAttach(dataAttach)
                }
            }
        } catch (error) {
            console.error("Lỗi lấy file đính kèm" + error);
        }
    }, [SRIdFromUrl]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Bắt đầu quá trình load

            try {
                await Promise.all([getInfoscientificResearch(), getAttach()]); // Đợi cả 2 function hoàn thành
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu: " + error);
            } finally {
                setIsLoading(false); // Đặt trạng thái hoàn tất sau khi cả hai function hoàn thành
            }
        };

        if (SRIdFromUrl) {
            fetchData();
        }
    }, [SRIdFromUrl, getAttach, getInfoscientificResearch]);



    // Hàm để xử lý upload file
    const handleUpload = async (files) => {

        if (files.length === 0) {
            message.warning('Please select a file to upload.'); // Kiểm tra xem có file đã chọn hay không
            return;
        }

        try {
            await uploadFile(files, userId, SRIdFromUrl); // Gọi hàm upload file            
            message.success('Tệp đã được tải lên thành công');
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Tải tệp lên thất bại.');
        } finally {
            getAttach();
        }
    };

    // Hàm xử lý download file
    const handleDownload = async (file) => {
        setLoadingFiles(prev => ({ ...prev, [file]: true })); // Bắt đầu tải file cho file cụ thể
        try {
            await downloadFile(file); // Gọi hàm download file
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setLoadingFiles(prev => ({ ...prev, [file]: false })); // Kết thúc tải file cho file cụ thể
        }
    }


    const dataInfoSystem = useMemo(() => [
        { title: 'Người tạo', description: scientificResearch ? scientificResearch.createUser.fullname : '' },
        { title: 'Ngày tạo', description: scientificResearch ? format(scientificResearch.createDate, 'dd/MM/yyyy HH:mm:ss') : '' },
        {
            title: 'Người chỉnh sửa', description: scientificResearch ?
                scientificResearch.lastModifyUser ?
                    scientificResearch.lastModifyUser.fullname :
                    scientificResearch.createUser.fullname
                : ''
        },
        { title: 'Ngày chỉnh sửa', description: scientificResearch ? format(scientificResearch.lastModifyDate, 'dd/MM/yyyy HH:mm:ss') : '' },
    ], [scientificResearch]);

    const columns = [
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
            key: 'createUser',
            dataIndex: 'createUser',
        },
    ];

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Chi tiết',
            children: <ThongTinDeTaiNCKHThamGia scientificResearch={scientificResearch} />,
        },
        {
            id: 2,
            title: 'Thảo luận',
            children: <ChatBox />,
        },
        {
            id: 3,
            title: 'Đính kèm',
            children: <Attach columns={columns} data={dataAttach} />,
        },
        {
            id: 4,
            title: 'Hệ thống',
            children: <System dataInfoSystem={dataInfoSystem} dataFollower={dataFollower} reLoad={getInfoscientificResearch} />,
        },
    ];

    const urlNCKH = () => {
        if (permission !== "SINHVIEN") {
            if (SRGIdFromUrl) {
                return `${config.routes.DeTaiNCKH_Department}?SRGId=${SRGIdFromUrl}`
            }
            else {
                return `${config.routes.DeTaiNCKH_Department}?tabIndex=2`
            }

        }
        else {
            if (SRGIdFromUrl) {
                return `${config.routes.DeTaiNCKH}?SRGId=${SRGIdFromUrl}`
            }
            else {
                return `${config.routes.DeTaiNCKH}?tabIndex=2`
            }
        }

    }



    return isLoading ? (
        <div className={cx('container-loading')}>
            <Spin size="large" />
        </div>
    ) : (
        < div className={cx('wrapper-DeTaiNCKHThamGia')} >
            <Breadcrumb
                className={cx('breadcrumb')}
                items={isAll !== "true" ?
                    [
                        // Kiểm tra nếu urlPrevious từ NhomDeTaiNCKH thì mới hiển thị
                        ...(SRGIdFromUrl
                            ? [
                                {
                                    title: <Link
                                        to={
                                            permission === "SINHVIEN"
                                                ? config.routes.NhomDeTaiNCKH
                                                : config.routes.NhomDeTaiNCKH_Department
                                        }>
                                        Nhóm đề tài nghiên cứu khoa học
                                    </Link>,
                                }
                            ] : []),
                        {
                            title: <span
                                className={cx('breadcrumb-item')}
                                onClick={() => {
                                    const url = urlNCKH();
                                    navigate(url);
                                }}
                            >
                                Danh sách đề tài nghiên cứu khoa học
                            </span>,
                        },
                        {
                            title: "Thông tin đề tài nghiên cứu khoa học",
                        },

                    ]
                    :
                    [
                        {
                            title: <Link to={
                                permission === "SINHVIEN"
                                    ? config.routes.NhomDeTaiNCKH
                                    : config.routes.NhomDeTaiNCKH_Department
                            } >
                                Nhóm đề tài nghiên cứu khoa học
                            </Link>,
                        },
                        {
                            title: "Thông tin đề tài nghiên cứu khoa học",
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
                        Thông tin đề tài nghiên cứu khoa học
                    </h3>
                </div>
                {isToolbar && (
                    <div className={cx('wrapper-toolbar')}>
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

export default DeTaiNCKHThamGia;

