import { useEffect, useMemo, useState, useContext, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DeTaiKhoaLuan.module.scss';
import { Breadcrumb, Card, Divider, Empty, Input, List, Select, Skeleton, Tabs, Tag } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getByThesisGroupIdAndCheckApprove } from '../../../services/thesisService';
import { deleteThesisUserByUserIdAndThesisId, getWhere } from '../../../services/thesisUserService';
import DeTaiKhoaLuanDetail from '../../../components/FormDetail/DeTaiKhoaLuanDetail';
import DeTaiKhoaLuanRegister from '../../../components/FormRegister/DeTaiKhoaLuanRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getUserById } from '../../../services/userService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getThesisGroupById } from '../../../services/thesisGroupService';
import notifications from '../../../config/notifications';
import dayjs from 'dayjs';
import FormItem from '../../../components/Core/FormItem';
import { getStatusByType } from '../../../services/statusService';
import SearchForm from '../../../components/Core/SearchForm';
import Toolbar from '../../../components/Core/Toolbar';
import { useConfirm } from '../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function DeTaiKhoaLuan() {
    const [list, setList] = useState([]);
    const { cancelRegisterConfirm } = useConfirm();
    const [listOriginal, setListOriginal] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listthesisRegister, setListThesisRegister] = useState([]);
    const [listThesisRegisterOriginal, setListThesisRegisterOriginal] = useState([]);
    const [ThesisGroupName, setThesisGroupName] = useState();
    const thesisCancelRef = useRef(null);
    const { deleteNotification } = useSocketNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showFilter1, setShowFilter1] = useState(false);
    const [showFilter2, setShowFilter2] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);

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

    // Xử lý active tab từ url
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);



    useEffect(() => {
        // Lấy tabIndex từ URL
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

        setTabActive(tabId);
    };


    // Xử lý lấy ThesisGroupId    
    const ThesisGroupIdFromUrl = queryParams.get('ThesisGroupId');


    const fetchthesiss = useCallback(async () => {
        try {
            const response = await getByThesisGroupIdAndCheckApprove({ userId: userId, ThesisGroupId: ThesisGroupIdFromUrl });

            if (response.status === 200) {
                setList(response.data.data);
                setListOriginal(response.data.data)
            }

        } catch (error) {
            console.error('Error fetching thesiss:', error);
        }
        finally {
            setIsLoading(false);

        }
    }, [ThesisGroupIdFromUrl, userId]);

    const checkRegisterThesis = useCallback(async () => {
        try {
            const response = await getWhere({ userId: userId, srgroupId: ThesisGroupIdFromUrl });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredthesiss = response.data.data.map(data => data.thesis.thesisId);
            setListThesisRegister(response.data.data);
            setListThesisRegisterOriginal(response.data.data)
        } catch (error) {
            console.error('Error fetching registered thesiss:', error);
        }
    }, [ThesisGroupIdFromUrl, userId]);


    useEffect(() => {
        const getThesisGroupName = async () => {
            try {
                const thesisGroup = await getThesisGroupById(ThesisGroupIdFromUrl)
                if (thesisGroup.status === 200) {
                    setThesisGroupName(thesisGroup.data.data.thesisGroupName);
                }
            } catch (error) {
                console.error("Lỗi lấy tên thesisGroup")
            }
        }
        if (ThesisGroupIdFromUrl) {
            getThesisGroupName();
        }
    }, [ThesisGroupIdFromUrl])


    useEffect(() => {
        fetchthesiss()
        checkRegisterThesis();
    }, [fetchthesiss, checkRegisterThesis]);



    const handleCancelNotification = async () => {
        const thesisCancel = thesisCancelRef.current;
        try {
            let listMember = [];
            const ThesisUser = await getWhere({ userId: userId, srId: thesisCancel.thesisId });

            if (ThesisUser.data.data[0].group !== 0) {
                const listThesisUser = await getWhere({ group: ThesisUser.data.data[0].group })
                listMember = listThesisUser.data.data
                    .filter((ThesisUser) => ThesisUser.user.userId !== userId)
                    .map((ThesisUser) => ThesisUser.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getKhoaLuanNotification('register', thesisCancel, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await deleteNotification(itemNoti.toUsers, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };

    // Hàm xử lý hủy đăng ký đề tài với xác nhận
    const handleCancelWithConfirm = async () => {
        if (thesisCancelRef.current) {
            try {
                //xóa thông báo
                await handleCancelNotification();
                // Xóa danh sách đăng ký trong bảng SGU
                const responseCancel = await deleteThesisUserByUserIdAndThesisId({ thesis: thesisCancelRef.current.thesisId, user: userId });
                if (responseCancel) {
                    message.success('Hủy đăng ký thành công');
                    // Cập nhật danh sách đề tài đã đăng ký
                    await checkRegisterThesis();
                    await fetchthesiss(); // Cập nhật danh sách đề tài


                }
            } catch (error) {
                message.error('Hủy đăng ký thất bại');
            } finally {
                thesisCancelRef.current = null // Reset thesisCancel sau khi xử lý
            }
        } else {
            message.error('đề tài không hợp lệ');
        }
    };

    const DeTaiKhoaLuanDetailMemoized = useMemo(() => (
        <DeTaiKhoaLuanDetail
            title={'đề tài khóa luận'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const DeTaiKhoaLuanRegisterMemoized = useMemo(() => (
        <DeTaiKhoaLuanRegister
            title={
                <>
                    <p>Đăng ký đề tài khóa luận</p>
                    <p className={cx("title-model-register")}>{showModalRegister.thesisName}</p>
                </>
            }
            showModal={showModalRegister}
            setShowModal={setShowModalRegister}
            checkRegisterThesis={checkRegisterThesis}
        />
    ), [checkRegisterThesis, showModalRegister]);

    // Set tab được chọn vào state 
    const handleTabClick = (index) => {
        setTabActive(index)
    };

    const statusType = 'Tiến độ đề tài khóa luận';
    // Fetch danh sách trạng thái theo loại "Tiến độ đề tài nghiên cứu"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const response = await getStatusByType(statusType);
                if (response) {
                    const options = response.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setStatusOptions(options);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    // Tạo field cho bộ lọc
    const filterFieldsDeTaiKhoaLuan = [
        <FormItem
            name={'thesisId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisName'}
            label={'Tên đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'instructorName'}
            label={'Chủ nhiệm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'status'}
            label={'Trạng thái'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={statusOptions}
                labelInValue
            />
        </FormItem>
    ]

    const onSearchDeTaiKhoaLuan = (values) => {
        const { thesisId, thesisName, instructorName, level } = values;
        const originalList = showFilter2 ? listThesisRegisterOriginal : listOriginal;
        const filteredList = originalList.filter((SRRegister) => {
            const item = showFilter2 ? SRRegister.thesis : SRRegister;
            const matchesSRId = thesisId ? item.thesisId?.toLowerCase().includes(thesisId.toLowerCase()) : true;
            const matchesSRName = thesisName ? item.thesisName?.toLowerCase().includes(thesisName.toLowerCase()) : true;
            const matchesInstructorName = instructorName ? item.instructor?.fullname?.toLowerCase().includes(instructorName.toLowerCase()) : true;
            const matchesLevel = level ? item.level === level : true;

            return matchesSRId && matchesSRName && matchesInstructorName && matchesLevel;
        });
        if (showFilter2) {
            setListThesisRegister(filteredList);
        }
        else {
            setList(filteredList);
        }
    };


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <>
                    <div className={`slide ${showFilter1 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsDeTaiKhoaLuan}
                            onSearch={onSearchDeTaiKhoaLuan}
                            onReset={() => { setList(listOriginal) }}
                        />
                        <Divider />
                    </div>
                    <List
                        loading={isLoading}
                        pagination={{
                            position: 'bottom',
                            align: 'end',
                        }}
                        dataSource={list}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <Button outline verysmall onClick={() => setShowModalDetail(item)}>
                                        Chi tiết
                                    </Button>,
                                    listthesisRegister && listthesisRegister.some(thesisRegister => thesisRegister.thesis.thesisId === item.thesisId) ?
                                        <Button
                                            colorRed
                                            outline
                                            verysmall
                                            onClick={() => {
                                                thesisCancelRef.current = item;
                                                setTimeout(() => cancelRegisterConfirm('đề tài khóa luận', handleCancelWithConfirm), 0);
                                            }}
                                            disabled={item.approve}
                                        >
                                            Hủy đăng ký
                                        </Button> :
                                        <Button primary verysmall onClick={() => setShowModalRegister(item)}>
                                            Đăng ký
                                        </Button>,
                                ]}
                            >
                                <Skeleton avatar title={false} loading={isLoading} active>
                                    <List.Item.Meta
                                        avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                        title={<div className={cx('name')}>{item.thesisId} - {item.thesisName}</div>}
                                        description={
                                            <div>
                                                <p>Lượt đăng ký: {item.count} </p>
                                                <p>Giảng viên hướng dẫn: {item.instructor.fullname}</p>
                                                <p style={{ display: screenWidth < 768 ? 'block' : 'none' }}>
                                                    Thời gian thực hiện:
                                                </p>
                                                <div style={{ display: screenWidth < 768 ? 'block' : 'none' }}>
                                                    <p>
                                                        Từ: {item.startDate && dayjs(item.startDate).format('DD/MM/YYYY HH:mm')}
                                                    </p>
                                                    <p>
                                                        Đến: {item.finishDate && dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        }
                                    />
                                    <p></p>
                                    <div
                                        className={cx('container-deadline-register')}
                                        style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                    >
                                        <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                        {item.startDate && item.finishDate
                                            ? <p>{dayjs(item.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                            : <p>Chưa có</p>
                                        }
                                    </div>
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </>
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia (theo nhóm đề tài)',
            children: (
                <div>
                    <div className={`slide ${showFilter2 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsDeTaiKhoaLuan}
                            onSearch={onSearchDeTaiKhoaLuan}
                            onReset={() => { setListThesisRegister(listThesisRegisterOriginal) }}
                        />
                        <Divider />
                    </div>
                    {(listthesisRegister?.length === 0 || !listthesisRegister) &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listthesisRegister && listthesisRegister.map((item, index) => {
                        return (
                            <Card
                                className={cx('card-DeTaiKhoaLuanThamGia')}
                                key={index}
                                type="inner"
                                title={item.thesis.thesisId + " - " + item.thesis.thesisName}
                                extra={
                                    <Button primary verysmall
                                        onClick={() => {
                                            if (!item.isApprove) {
                                                // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                                setShowModalDetail(item.thesis);
                                            }
                                            else {
                                                // Nếu đã được duyệt => Chuyển vào page DeTaiKhoaLuanThamGia
                                                navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesis.thesisId}`);
                                            }
                                        }}
                                    >

                                        Chi tiết
                                    </Button>
                                }
                            >
                                <div className={cx('container-detail')}>
                                    <p className={cx('label-detail')}>Thời gian thực hiện: </p>
                                    {item.startDate && item.finishDate
                                        ? <p>{dayjs(item.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                        : <p>Chưa có</p>
                                    }
                                </div>
                                <div className={cx('container-detail')}>
                                    <p className={cx('label-detail')}>Trạng thái: </p>
                                    <Tag
                                        color={item.isApprove ? item.thesis.status.color : 'red'}
                                    >
                                        {item.isApprove ? item.thesis.status.statusName : 'Chờ duyệt'}
                                    </Tag>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            {
                ThesisGroupIdFromUrl &&
                <Breadcrumb
                    className={cx('breadcrumb')}
                    items={[
                        {
                            title: <Link to={config.routes.NhomDeTaiKhoaLuan}>Nhóm đề tài khóa luận</Link>,
                        },
                        {
                            title: 'Danh sách đề tài khóa luận',
                        },
                    ]}
                />
            }
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>

                    <h3 className={cx('title')}>
                        {
                            ThesisGroupIdFromUrl
                                ? `Danh sách đề tài khóa luận nhóm: ${ThesisGroupName}`
                                : 'Danh sách đề tài khóa luận'
                        }

                    </h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Bộ lọc'}
                        onClick={() => {
                            if (tabActive === 1) {
                                setShowFilter1(!showFilter1);
                                if (showFilter2) setShowFilter2(false);
                            }
                            else {
                                setShowFilter2(!showFilter2);
                                if (showFilter1) setShowFilter1(false);
                            }

                        }}
                    />
                </div>
            </div>
            <Tabs
                activeKey={tabActive}
                onChange={handleTabChange}
                centered
                onTabClick={(index) => handleTabClick(index)}
                items={ITEM_TABS.map((item, index) => ({
                    label: item.title,
                    key: index + 1,
                    children: item.children,
                }))}
            />
            {DeTaiKhoaLuanDetailMemoized}
            {DeTaiKhoaLuanRegisterMemoized}
        </div>
    );
}

export default DeTaiKhoaLuan;
