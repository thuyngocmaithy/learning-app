import { useEffect, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabDeTaiKhoaLuanThamGia.module.scss';
import { Card, Col, Divider, Empty, Row, Spin, Tag } from 'antd';
import Button from '../Core/Button';
import config from '../../config';
import { getWhere } from '../../services/thesisUserService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import SearchForm from '../Core/SearchForm';
import { getListThesisJoined } from '../../services/thesisService';

const cx = classNames.bind(styles);

function TabDeTaiKhoaLuanThamGia({
    listThesisJoin,
    listThesisJoinOriginal,
    setListThesisJoin,
    setListThesisJoinOriginal,
    showFilter,
    filterFields,
    onSearch,
    setShowModalDetail,
    reLoadListJoinThesis,
    loadedList = false,
    setLoadedList
}) {
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(!loadedList);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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


    // Xử lý lấy ThesisGroupId    
    const ThesisGroupIdFromUrl = queryParams.get('ThesisGroupId');

    const checkJoinThesis = useCallback(async () => {
        setIsLoading(true);
        try {
            let result;
            if (location.pathname === config.routes.DeTaiKhoaLuan_Department) {
                // Gửi yêu cầu API để lấy danh sách các đề tài dựa trên ID giảng viên và nhóm nghiên cứu khoa học
                const response = await getListThesisJoined(userId, ThesisGroupIdFromUrl);
                result = response?.data?.data?.map((item) => ({
                    thesis: item,
                }));
            }
            else {
                if (ThesisGroupIdFromUrl) {
                    const response = await getWhere({ userId: userId, srgroupId: ThesisGroupIdFromUrl });
                    result = response?.data?.data;

                } else {
                    const response = await getWhere({ userId: userId });
                    result = response?.data?.data;
                }
            }

            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredthesiss = response.data.data.map(data => data.thesis.thesisId);
            setListThesisJoin(result);
            setListThesisJoinOriginal(result)
        } catch (error) {
            console.error('Error fetching registered thesiss:', error);
        }
        finally {
            setIsLoading(false);
            if (setLoadedList) setLoadedList(true);
        }
    }, [ThesisGroupIdFromUrl, location.pathname, setListThesisJoin, setListThesisJoinOriginal, setLoadedList, userId]);


    useEffect(() => {
        if (reLoadListJoinThesis) {
            checkJoinThesis();
        }
    }, [checkJoinThesis, reLoadListJoinThesis]);


    useEffect(() => {
        if (!loadedList) {
            checkJoinThesis();
        }
    }, [checkJoinThesis, loadedList]);


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
                    getFields={filterFields}
                    onSearch={onSearch}
                    onReset={() => { setListThesisJoin(listThesisJoinOriginal) }}
                />
                <Divider />
            </div>
            {(listThesisJoin?.length === 0 || !listThesisJoin) &&
                <Empty className={cx("empty")} description="Không có dữ liệu" />
            }
            {listThesisJoin && listThesisJoin.map((item, index) => {
                return (
                    <Card
                        className={cx('card-DeTaiKhoaLuanThamGia')}
                        key={index}
                        type="inner"
                        title={item.thesis.thesisId + " - " + item.thesis.thesisName}
                        extra={
                            <Button primary verysmall
                                onClick={() => {
                                    if (!item.isApprove && location.pathname === config.routes.DeTaiKhoaLuan) {
                                        // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                        setShowModalDetail(item.thesis);
                                    }
                                    else {
                                        if (ThesisGroupIdFromUrl) {
                                            // Nếu đã được duyệt => Chuyển vào page DeTaiNCKHThamGia
                                            navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesis.thesisId}&ThesisGroup=${ThesisGroupIdFromUrl}`);
                                        }
                                        else {
                                            navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesis.thesisId}`);
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
                                <p className={cx('item-description')}>Chủ nhiệm đề tài: {item.thesis?.instructor?.fullname}</p>
                                {location.pathname === config.routes.DeTaiKhoaLuan_Department &&
                                    <div className={cx('item-description')}>
                                        <p>Sinh viên thực hiện:</p>
                                        {item.thesis?.users.length > 0 &&
                                            <ul className={cx('list-student-perform')}>
                                                {item.thesis?.users?.map(itemUser => {
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
                                    {item.thesis.startDate && item.thesis.finishDate
                                        ? <p>{dayjs(item.thesis.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.thesis.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                        : <p>Chưa có</p>
                                    }
                                </div>
                                <p className={cx('item-description')}>
                                    Trạng thái:
                                    <Tag color={(item.isApprove || location.pathname === config.routes.DeTaiKhoaLuan_Department) ? item.thesis?.status?.color : 'red'} className={cx('tag-status')}>
                                        {(item.isApprove || location.pathname === config.routes.DeTaiKhoaLuan_Department) ? item.thesis?.status?.statusName : 'Chờ duyệt'}
                                    </Tag>
                                </p>
                            </Col>
                        </Row>
                    </Card>
                );
            })}
        </div>
    );
}

export default TabDeTaiKhoaLuanThamGia;
