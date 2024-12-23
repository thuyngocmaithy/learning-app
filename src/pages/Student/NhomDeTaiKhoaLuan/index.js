import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiKhoaLuan.module.scss';
import { Divider, Input, List, Select, Skeleton, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import DeTaiKhoaLuanDetail from '../../../components/FormDetail/DeTaiKhoaLuanDetail';
import DeTaiKhoaLuanRegister from '../../../components/FormRegister/DeTaiKhoaLuanRegister';
import { useNavigate } from 'react-router-dom';
import { getWhere as getWhereThesisGroup } from '../../../services/thesisGroupService';
import FormItem from '../../../components/Core/FormItem';
import { getStatusByType } from '../../../services/statusService';
import { getAllFaculty } from '../../../services/facultyService';
import SearchForm from '../../../components/Core/SearchForm';
import Toolbar from '../../../components/Core/Toolbar';

const cx = classNames.bind(styles);

function NhomDeTaiKhoaLuan() {
    const [list, setList] = useState([]);
    const [originalList, setOriginalList] = useState([]); // Bản sao danh sách ban đầu
    const [isLoading, setIsLoading] = useState(true); // load ds nhóm đề tài khóa luận
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [nhomDeTaiStatusOptions, setNhomDeTaiStatusOptions] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const navigate = useNavigate();

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


    const fetchThesis = async () => {
        try {
            const result = await getWhereThesisGroup({ disabled: false })
            if (result.status === 200) {
                setList(result.data.data);
                setOriginalList(result.data.data)
            }
        } catch (error) {
            console.error('Error fetching Thesis:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchThesis();
    }, []);


    // SEARCH NHÓM ĐỀ TÀI KHÓA LUẬN
    //lấy danh sách các khoa ra ngoài thẻ select
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await getAllFaculty();
                if (response && response.data) {
                    const options = response.data.map((faculty) => ({
                        value: faculty.facultyId,
                        label: faculty.facultyName,
                    }));
                    setFacultyOptions(options);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchFaculties();
    }, []);

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài khóa luận" và "Tiến độ đề tài khóa luận"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const responseNhomDeTai = await getStatusByType('Tiến độ nhóm đề tài khóa luận');
                if (responseNhomDeTai) {
                    const optionsNhomDeTai = responseNhomDeTai.map((status) => ({
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

    // Tạo field cho bộ lọc nhóm đề tài khóa luận
    const filterFieldsNhomDeTaiKhoaLuan = [
        <FormItem
            name={'thesisGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisGroupName'}
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
            name={'faculty'}
            label={'Khoa'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={facultyOptions}
                labelInValue
            />
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
                options={nhomDeTaiStatusOptions}
                labelInValue
            />
        </FormItem>
    ];

    // Hàm tìm kiếm dựa trên danh sách đã có
    const onSearchNhomDeTaiKhoaLuan = (values) => {
        const { thesisGroupId, thesisGroupName, startYear, finishYear, faculty, status } = values;

        const filteredList = originalList.filter((item) => {
            const matchesThesisGroupId = thesisGroupId ? item.thesisGroupId?.toLowerCase().includes(thesisGroupId.toLowerCase()) : true;
            const matchesThesisGroupName = thesisGroupName ? item.thesisGroupName?.toLowerCase().includes(thesisGroupName.toLowerCase()) : true;
            const matchesStartYear = startYear ? item.startYear?.toString().includes(startYear) : true;
            const matchesFinishYear = finishYear ? item.finishYear?.toString().includes(finishYear) : true;
            const matchesFaculty = faculty?.value ? item.faculty.facultyId === faculty.value : true;
            const matchesStatus = status?.value ? item.status.statusId === status.value : true;

            return matchesThesisGroupId && matchesThesisGroupName && matchesStartYear && matchesFinishYear && matchesFaculty && matchesStatus;
        });

        setList(filteredList);
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
        />
    ), [showModalRegister]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài khóa luận</h3>
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
                        getFields={filterFieldsNhomDeTaiKhoaLuan}
                        onSearch={onSearchNhomDeTaiKhoaLuan}
                        onReset={() => { setList(originalList) }}
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
                                        navigate(`${config.routes.DeTaiKhoaLuan}?ThesisGroupId=${item.thesisGroupId}`,
                                            { state: { from: `${config.routes.NhomDeTaiKhoaLuan}_active` } });
                                    }}
                                >
                                    Danh sách
                                </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.thesisGroupId} - {item.thesisGroupName}</div>}
                                    description={
                                        <div>
                                            <p
                                                style={{ display: screenWidth < 768 ? 'flex' : 'none', margin: "7px 0" }}
                                            >
                                                Thời gian thực hiện: {item.startYear} - {item.finishYear}
                                            </p>
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
            {DeTaiKhoaLuanDetailMemoized}
            {DeTaiKhoaLuanRegisterMemoized}
        </div>
    );
}

export default NhomDeTaiKhoaLuan;
