import { useEffect, useMemo, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Divider, Input, List, Select, Skeleton, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { useNavigate } from 'react-router-dom';
import { getWhere as getWhereSRG } from '../../../services/scientificResearchGroupService';
import FormItem from '../../../components/Core/FormItem';
import SearchForm from '../../../components/Core/SearchForm';
import Toolbar from '../../../components/Core/Toolbar';
import { getStatusByType } from '../../../services/statusService';
import { useContext } from 'react';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);

function NhomDeTaiNCKH() {
    const { faculty } = useContext(AccountLoginContext);
    const [list, setList] = useState([]);
    const [originalList, setOriginalList] = useState([]); // Bản sao danh sách ban đầu
    const [isLoading, setIsLoading] = useState(true); // load ds nhóm đề tài NCKH
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [nhomDeTaistatusOptions, setNhomDeTaiStatusOptions] = useState([]);


    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài nghiên cứu"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const responseNhom = await getStatusByType('Tiến độ nhóm đề tài NCKH');
                if (responseNhom) {
                    const optionsNhomDeTai = responseNhom.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setNhomDeTaiStatusOptions(optionsNhomDeTai);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatusByType();
    }, []);


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
    const navigate = useNavigate();
    const fetchSRG = useCallback(async () => {
        try {
            const result = await getWhereSRG({ faculty: faculty, disabled: false })
            console.log(faculty);
            if (result.status === 200) {
                setList(result.data.data);
                setOriginalList(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSRG();
    }, [fetchSRG]);

    // SEARCH NHÓM ĐỀ TÀI NCKH
    // Tạo field cho bộ lọc nhóm đề tài NCKH
    const filterFieldsNhomDeTaiNCKH = [
        <FormItem
            name={'scientificResearchGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchGroupName'}
            label={'Tên nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'startYear'}
            label={'Năm thực hiện'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'finishYear'}
            label={'Năm kết thúc'}
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
                options={nhomDeTaistatusOptions}
                labelInValue
            />
        </FormItem>
    ];

    // Hàm tìm kiếm dựa trên danh sách đã có
    const onSearchNhomDeTaiNCKH = (values) => {
        const { scientificResearchGroupId, scientificResearchGroupName, startYear, finishYear, faculty, status } = values;

        const filteredList = originalList.filter((item) => {
            const matchesSRGId = scientificResearchGroupId ? item.scientificResearchGroupId?.toLowerCase().includes(scientificResearchGroupId.toLowerCase()) : true;
            const matchesSRGName = scientificResearchGroupName ? item.scientificResearchGroupName?.toLowerCase().includes(scientificResearchGroupName.toLowerCase()) : true;
            const matchesStartYear = startYear ? item.startYear?.toString().includes(startYear) : true;
            const matchesFinishYear = finishYear ? item.finishYear?.toString().includes(finishYear) : true;
            const matchesFaculty = faculty?.value ? item.faculty.facultyId === faculty.value : true;
            const matchesStatus = status?.value ? item.status.statusId === status.value : true;

            return matchesSRGId && matchesSRGName && matchesStartYear && matchesFinishYear && matchesFaculty && matchesStatus;
        });

        setList(filteredList);
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
        />
    ), [showModalRegister]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài nghiên cứu khoa học</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }}
                    />
                </div>
            </div>

            <>
                <div className={`slide ${showFilter ? 'open' : ''}`}>
                    <SearchForm
                        getFields={filterFieldsNhomDeTaiNCKH}
                        onSearch={onSearchNhomDeTaiNCKH}
                        onReset={() => { fetchSRG() }}
                    />
                    <Divider />
                </div>
                <List
                    loading={isLoading}
                    pagination={{
                        position: 'bottom',
                        align: 'end',
                        onChange: (page) => setCurrentPage(page), // Lưu số trang hiện tại
                        pageSize: pageSize, // Số mục trong một trang
                    }}
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    primary
                                    verysmall
                                    onClick={() => {
                                        navigate(`${config.routes.DeTaiNCKH}?SRGId=${item.scientificResearchGroupId}`,
                                            { state: { from: `${config.routes.NhomDeTaiNCKH}_active` } });
                                    }}
                                >
                                    Danh sách
                                </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.scientificResearchGroupId} - {item.scientificResearchGroupName}</div>}
                                    description={
                                        <div>
                                            <div
                                                className={cx('container-deadline-register')}
                                                style={{ display: screenWidth < 768 ? 'flex' : 'none', margin: "7px 0" }}
                                            >
                                                <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                                <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                                            </div>
                                            <p>Khoa: {item.faculty.facultyName}</p>
                                            <p style={{ margin: "7px 0" }}>
                                                Trạng thái:
                                                <Tag color={item.status.color} className={cx('tag-status')}>
                                                    {item.status.statusName}
                                                </Tag>
                                            </p>
                                        </div>
                                    }
                                />
                                <div
                                    className={cx('container-deadline-register')}
                                    style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                >
                                    <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                    <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                                </div>
                            </Skeleton>
                        </List.Item>
                    )}
                />
            </>
            {DeTaiNCKHDetailMemoized}
            {DeTaiNCKHRegisterMemoized}
        </div>
    );
}

export default NhomDeTaiNCKH;

