import { useEffect, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabDeTaiNCKHThamGia.module.scss';
import { Card, Col, Divider, Empty, Row, Spin, Tag } from 'antd';
import Button from '../../components/Core/Button';
import config from '../../config';
import { getWhere } from '../../services/scientificResearchUserService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import SearchForm from '../Core/SearchForm';
import { getListSRJoined } from '../../services/scientificResearchService';

const cx = classNames.bind(styles);

function TabDeTaiNCKHThamGia({
    listSRJoin,
    listSRJoinOriginal,
    setListSRJoin,
    setListSRJoinOriginal,
    showFilter,
    filterFieldsDeTaiNCKH,
    onSearchDeTaiNCKH,
    setShowModalDetail,
    reLoadListJoinSR,
    loadedList = false,
    setLoadedList
}) {
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(!loadedList);
    const navigate = useNavigate();
    const location = useLocation();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const queryParams = new URLSearchParams(location.search);

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


    // Xử lý lấy SRGId    
    const SRGIdFromUrl = queryParams.get('SRGId');

    const checkJoinSR = useCallback(async () => {
        setIsLoading(true);
        try {
            let result;
            if (location.pathname === config.routes.DeTaiNCKH_Department) {
                // Gửi yêu cầu API để lấy danh sách các đề tài dựa trên ID giảng viên và nhóm nghiên cứu khoa học
                const response = await getListSRJoined(userId, SRGIdFromUrl);
                result = response?.data?.data.map((item) => ({
                    scientificResearch: item,
                }));
            }
            else {
                if (SRGIdFromUrl) {
                    const response = await getWhere({ userId: userId, srgroupId: SRGIdFromUrl });
                    result = response?.data?.data;

                } else {
                    const response = await getWhere({ userId: userId });
                    result = response?.data?.data;
                }
            }

            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredscientificResearchs = response.data.data.map(data => data.scientificResearch.scientificResearchId);
            setListSRJoin(result);
            setListSRJoinOriginal(result)
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
        }
        finally {
            setIsLoading(false);
            if (setLoadedList) setLoadedList(true);
        }
    }, [SRGIdFromUrl, location.pathname, setListSRJoin, setListSRJoinOriginal, setLoadedList, userId]);


    useEffect(() => {
        if (reLoadListJoinSR) {
            checkJoinSR();
        }
    }, [checkJoinSR, reLoadListJoinSR]);


    useEffect(() => {
        if (!loadedList) {
            checkJoinSR();
        }
    }, [checkJoinSR, loadedList]);


    // Nếu đang tải, hiển thị Spinner
    if (isLoading) {
        return (
            <div className="container-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={filterFieldsDeTaiNCKH}
                    onSearch={onSearchDeTaiNCKH}
                    onReset={() => { setListSRJoin(listSRJoinOriginal) }}
                />
                <Divider />
            </div>
            {(listSRJoin?.length === 0 || !listSRJoin) &&
                <Empty className={cx("empty")} description="Không có dữ liệu" />
            }
            {listSRJoin && listSRJoin.map((item, index) => {
                return (
                    <Card
                        className={cx('card-DeTaiNCKHThamGia')}
                        key={index}
                        type="inner"
                        title={item.scientificResearch.scientificResearchId + " - " + item.scientificResearch.scientificResearchName}
                        extra={
                            <Button primary verysmall
                                onClick={() => {
                                    if (!item.isApprove && location.pathname === config.routes.DeTaiNCKH) {
                                        // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                        setShowModalDetail(item.scientificResearch);
                                    }
                                    else {
                                        if (SRGIdFromUrl) {
                                            // Nếu đã được duyệt => Chuyển vào page DeTaiNCKHThamGia
                                            // chuyển từ trang Đề tài NCKH 
                                            navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearch.scientificResearchId}&SRG=${SRGIdFromUrl}`);
                                        }
                                        else {
                                            navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearch.scientificResearchId}`);
                                        }

                                    }
                                }}
                            >

                                Chi tiết
                            </Button>
                        }
                    >
                        <Row gutter={[16]}>
                            <Col span={12}>
                                <p className={cx('item-description')}>Cấp: {item.scientificResearch?.level}</p>
                                <p className={cx('item-description')}>Chủ nhiệm đề tài: {item.scientificResearch?.instructor?.fullname}</p>
                                {location.pathname === config.routes.DeTaiNCKH_Department &&
                                    <div className={cx('item-description')}>
                                        <p>Sinh viên thực hiện:</p>
                                        {item.scientificResearch?.users?.length > 0 &&
                                            <ul className={cx('list-student-perform')}>
                                                {item.scientificResearch?.users?.map(itemUser => {
                                                    if (itemUser.isApprove === 1)
                                                        return <li className={cx('student-perform')}>{itemUser.userId} - {itemUser.fullname}</li>
                                                })}
                                            </ul>
                                        }
                                    </div>
                                }
                            </Col>
                            <Col span={12}>
                                <div
                                    className={cx('container-deadline-register')}
                                    style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                >
                                    <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                    {item.scientificResearch.startDate && item.scientificResearch.finishDate
                                        ? <p>{dayjs(item.scientificResearch.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.scientificResearch.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                        : <p>Chưa có</p>
                                    }
                                </div>
                                <p className={cx('item-description')}>
                                    Trạng thái:
                                    <Tag color={(item.isApprove || location.pathname === config.routes.DeTaiNCKH_Department) ? item.scientificResearch?.status?.color : 'red'} className={cx('tag-status')}>
                                        {(item.isApprove || location.pathname === config.routes.DeTaiNCKH_Department) ? item.scientificResearch?.status?.statusName : 'Chờ duyệt'}
                                    </Tag>
                                </p>
                            </Col>
                        </Row>
                    </Card >
                );
            })}
        </div >
    );
}

export default TabDeTaiNCKHThamGia;
