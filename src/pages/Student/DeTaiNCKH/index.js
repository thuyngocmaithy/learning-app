import { useEffect, useMemo, useState, useContext, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DeTaiNCKH.module.scss';
import { Breadcrumb, Divider, Input, List, Select, Tabs } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getBySRGIdAndCheckApprove } from '../../../services/scientificResearchService';
import { deleteSRUByUserIdAndSRId, getWhere } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getUserById } from '../../../services/userService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import notifications from '../../../config/notifications';
import dayjs from 'dayjs';
import SearchForm from '../../../components/Core/SearchForm';
import Toolbar from '../../../components/Core/Toolbar';
import FormItem from '../../../components/Core/FormItem';
import { getStatusByType } from '../../../services/statusService';
import { useConfirm } from '../../../hooks/useConfirm';
import TabDeTaiNCKHThamGia from '../../../components/TabDeTaiNCKHThamGia';

const cx = classNames.bind(styles);

function DeTaiNCKH() {
    const { cancelRegisterConfirm } = useConfirm();
    const [reLoadListJoinSR, setReLoadListJoinSR] = useState(false);
    const [list, setList] = useState([]);
    const [listOriginal, setListOriginal] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); // load tất cả ds đề tài
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listSRJoin, setListSRJoin] = useState([]);
    const [listSRJoinOriginal, setListSRJoinOriginal] = useState([]);
    const [SRGName, setSRGName] = useState();
    const scientificResearchCancelRef = useRef(null);
    const { deleteNotification } = useSocketNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showFilter1, setShowFilter1] = useState(false);
    const [showFilter2, setShowFilter2] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);
    const [loadedListSRJoin, setLoadedListSRJoin] = useState(false); // đã load danh sách tham gia
    const [SRIsApproved, setSRIsApproved] = useState(false); // đã load danh sách tham gia

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

    // Lấy tabIndex từ URL nếu có
    const getInitialTabIndex = useCallback(() => {
        const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
        setTabActive(tab);
    }, [tabIndexFromUrl]);


    useEffect(() => {
        getInitialTabIndex();
    }, [getInitialTabIndex])

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

    const statusType = 'Tiến độ đề tài NCKH';
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


    // Xử lý lấy SRGId    
    const SRGIdFromUrl = queryParams.get('SRGId');

    // Lấy Danh sách đề 
    const fetchSR = useCallback(async () => {
        try {
            const response = await getBySRGIdAndCheckApprove({ userId: userId, SRGId: SRGIdFromUrl });
            if (response.status === 200) {
                setList(response.data.data);
                setListOriginal(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [SRGIdFromUrl, userId]);



    useEffect(() => {
        const getSRGName = async () => {
            try {
                const SRG = await getScientificResearchGroupById(SRGIdFromUrl)

                if (SRG.status === 200) {
                    setSRGName(SRG.data.data.scientificResearchGroupName);
                }
            } catch (error) {
                console.error("Lỗi lấy tên SRG")
            }
        }
        if (SRGIdFromUrl) {
            getSRGName();
        }
    }, [SRGIdFromUrl])



    useEffect(() => {
        fetchSR()
    }, [fetchSR]);

    const checkJoinSR = useCallback(async () => {
        try {
            let result;

            if (SRGIdFromUrl) {
                const response = await getWhere({ userId: userId, srgroupId: SRGIdFromUrl });
                result = response?.data?.data;

            } else {
                const response = await getWhere({ userId: userId });
                result = response?.data?.data;
            }
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredscientificResearchs = response.data.data.map(data => data.scientificResearch.scientificResearchId);
            setListSRJoin(result);
            setListSRJoinOriginal(result)
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
        }
        finally {
            setLoadedListSRJoin(true);
        }
    }, [SRGIdFromUrl, setListSRJoin, setListSRJoinOriginal, userId]);

    useEffect(() => {
        if (!loadedListSRJoin) {
            checkJoinSR();
        }
    }, [checkJoinSR, loadedListSRJoin]);


    const handleCancelNotification = async () => {
        const scientificResearchCancel = scientificResearchCancelRef.current;
        try {
            let listMember = [];
            const SRU = await getWhere({ userId: userId, srId: scientificResearchCancel.scientificResearchId });

            if (SRU.data.data[0].group !== 0) {
                const listSRU = await getWhere({ group: SRU.data.data[0].group })
                listMember = listSRU.data.data
                    .filter((SRU) => SRU.user.userId !== userId)
                    .map((SRU) => SRU.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('register', scientificResearchCancel, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await deleteNotification(itemNoti.toUsers, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };

    // Hàm xử lý hủy đăng ký đề tài với xác nhận
    const handleCancelWithConfirm = async () => {
        if (scientificResearchCancelRef.current) {
            try {
                //xóa thông báo
                await handleCancelNotification();
                // Xóa danh sách đăng ký trong bảng SGU
                const responseCancel = await deleteSRUByUserIdAndSRId({ scientificResearch: scientificResearchCancelRef.current.scientificResearchId, user: userId });
                if (responseCancel) {
                    message.success('Hủy đăng ký thành công');
                    // Cập nhật danh sách đề tài đã đăng ký
                    setReLoadListJoinSR(true);
                    await fetchSR(); // Cập nhật danh sách đề tài
                }
            } catch (error) {
                message.error('Hủy đăng ký thất bại');
            } finally {
                scientificResearchCancelRef.current = null // Reset scientificResearchCancel sau khi xử lý
            }
        } else {
            message.error('đề tài không hợp lệ');
        }
    };

    const DeTaiNCKHDetailMemoized = useMemo(() => (
        <DeTaiNCKHDetail
            title={'đề tài nghiên cứu'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const DeTaiNCKHRegisterMemoized = useMemo(() => (
        <DeTaiNCKHRegister
            title={
                <>
                    <p>Đăng ký đề tài nghiên cứu</p>
                    <p className={cx("title-model-register")}>{showModalRegister.scientificResearchName}</p>
                </>
            }
            showModal={showModalRegister}
            setShowModal={setShowModalRegister}
            setReLoadListJoinSR={setReLoadListJoinSR}
        />
    ), [showModalRegister]);

    // Set tab được chọn vào state 
    const handleTabClick = (index) => {
        setTabActive(index)
    };

    // SEARCH ĐỀ TÀI NCKH
    const levelOptions = [
        { value: 'Cơ sở', label: 'Cơ sở' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Bộ', label: 'Bộ' },
        { value: 'Quốc gia', label: 'Quốc gia' },
        { value: 'Quốc tế', label: 'Quốc tế' }
    ]

    // Tạo field cho bộ lọc
    const filterFieldsDeTaiNCKH = [
        <FormItem
            name={'scientificResearchId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchName'}
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
            name={'level'}
            label={'Cấp'}
        >
            <Select
                style={{ width: '100%' }}
                options={levelOptions}
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            />
        </FormItem>,
    ]

    showFilter2 && filterFieldsDeTaiNCKH.push(
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
    )

    const onSearchDeTaiNCKH = (values) => {
        const { scientificResearchId, scientificResearchName, instructorName, level, status } = values;
        const originalList = showFilter2 ? listSRJoinOriginal : listOriginal;
        const filteredList = originalList.filter((SRJoin) => {
            const item = showFilter2 ? SRJoin.scientificResearch : SRJoin;
            const matchesSRId = scientificResearchId ? item.scientificResearchId?.toLowerCase().includes(scientificResearchId.toLowerCase()) : true;
            const matchesSRName = scientificResearchName ? item.scientificResearchName?.toLowerCase().includes(scientificResearchName.toLowerCase()) : true;
            const matchesInstructorName = instructorName ? item.instructor?.fullname?.toLowerCase().includes(instructorName.toLowerCase()) : true;
            const matchesLevel = level ? item.level === level : true;
            const matchesStatus = status?.value ? item.status.statusId === status?.value : true;

            return matchesSRId && matchesSRName && matchesInstructorName && matchesLevel && matchesStatus;
        });
        if (showFilter2) {
            setListSRJoin(filteredList);
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
                            getFields={filterFieldsDeTaiNCKH}
                            onSearch={onSearchDeTaiNCKH}
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
                                    <Button className={cx('btnDetail')} outline verysmall onClick={() => setShowModalDetail(item)}>
                                        Chi tiết
                                    </Button>,
                                    listSRJoin && listSRJoin.some(scientificResearchRegister => scientificResearchRegister.scientificResearch.scientificResearchId === item.scientificResearchId) ?
                                        <Button
                                            colorRed
                                            outline
                                            verysmall
                                            onClick={() => {
                                                scientificResearchCancelRef.current = item;
                                                setTimeout(() => cancelRegisterConfirm('đề tài nghiên cứu', handleCancelWithConfirm), 0);
                                            }}
                                            disabled={item.approveForUser}
                                        >
                                            Hủy đăng ký
                                        </Button> :
                                        <Button primary verysmall onClick={() => setShowModalRegister(item)}>
                                            Đăng ký
                                        </Button>,
                                ]}
                            >

                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.scientificResearchId} - {item.scientificResearchName}</div>}
                                    description={
                                        <div>
                                            <p>Lượt đăng ký: {item.count} </p>
                                            <p>Cấp: {item.level}</p>
                                            <p>Giảng viên hướng dẫn: {item.instructor.fullname}</p>
                                            <p style={{ display: screenWidth < 768 ? 'block' : 'none' }}>
                                                Thời gian thực hiện:
                                                {
                                                    item.startDate && item.finishDate
                                                        ? dayjs(item.startDate).format('DD/MM/YYYY HH:mm') - dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')
                                                        : 'Chưa có'
                                                }
                                            </p>
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

                            </List.Item>
                        )}
                    />
                </>
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia',
            children: (
                <TabDeTaiNCKHThamGia
                    listSRJoin={listSRJoin}
                    listSRJoinOriginal={listSRJoinOriginal}
                    setListSRJoin={setListSRJoin}
                    setListSRJoinOriginal={setListSRJoinOriginal}
                    showFilter={showFilter2}
                    filterFieldsDeTaiNCKH={filterFieldsDeTaiNCKH}
                    onSearchDeTaiNCKH={onSearchDeTaiNCKH}
                    setShowModalDetail={setShowModalDetail}
                    reLoadListJoinSR={reLoadListJoinSR}
                    loadedList={loadedListSRJoin}
                    setLoadedList={setLoadedListSRJoin}
                />
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            {
                SRGIdFromUrl &&
                <Breadcrumb
                    className={cx('breadcrumb')}
                    items={[
                        {
                            title: <Link to={config.routes.NhomDeTaiNCKH}>Nhóm đề tài nghiên cứu khoa học</Link>,
                        },
                        {
                            title: 'Danh sách đề tài nghiên cứu khoa học',
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
                            SRGIdFromUrl
                                ? `Danh sách đề tài nghiên cứu khoa học nhóm: ${SRGName}`
                                : 'Danh sách đề tài nghiên cứu khoa học'
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
            {DeTaiNCKHDetailMemoized}
            {DeTaiNCKHRegisterMemoized}
        </div>
    );
}

export default DeTaiNCKH;
