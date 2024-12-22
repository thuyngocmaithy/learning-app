import classNames from 'classnames/bind';
import styles from './KhungCTDT.module.scss';
import { Divider, Input, Select } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { BuildOutlined, EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import KhungCTDTUpdate from '../../../../components/FormUpdate/KhungCTDTUpdate';
import { checkRelatedData, deleteStudyFrames, getAll as getAllStudyFrame } from '../../../../services/studyFrameService';
import { getAll as getAllCycle } from '../../../../services/cycleService';
import DungKhungCTDTUpdate from '../../../../components/FormUpdate/DungKhungCTDTUpdate';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getAll as getAllMajor } from '../../../../services/majorService';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import config from '../../../../config';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function KhungCTDT() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [showModalBuildFrame, setShowModalBuildFrame] = useState(false); // hiển thị model dựng khung
    const [buildFrameData, setBuildFrameData] = useState(false); // Data khung để dựng
    const [data, setData] = useState([]);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [majorOptions, setMajorOptions] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [cycleOptions, setCycleOptions] = useState([]);

    // Fetch danh sách chu kỳ
    useEffect(() => {
        const fetchCycle = async () => {
            try {
                const response = await getAllCycle();
                if (response) {
                    const options = response.data.data.map((cycle) => ({
                        value: cycle.cycleId,
                        label: cycle.cycleName,
                    }));
                    setCycleOptions(options);
                }
            } catch (error) {
                console.error('KhungCTDT - fetchCycle - error:', error);
            }
        };

        fetchCycle();
    }, []);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await getAllMajor();
                if (response && response.data) {
                    const options = response.data.map((major) => ({
                        value: major.majorId,
                        label: major.majorName,
                    }));
                    setMajorOptions(options);
                }
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };
        fetchFaculties();
    }, [showModal]);


    const columns = (showModal) => [
        {
            title: 'Mã khung đào tạo',
            dataIndex: 'frameId',
            key: 'frameId',
            width: '170px',
        },
        {
            title: 'Tên khung đào tạo',
            dataIndex: 'frameName',
            key: 'frameName',
        },
        {
            title: 'Ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycleName',
            key: 'cycleName',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '300px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnStructure')}
                        leftIcon={<BuildOutlined />}
                        outline
                        verysmall
                        onClick={() => {
                            setShowModalBuildFrame(true);
                            setBuildFrameData(record)
                        }}
                    >
                        Xây dựng khung
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            showModal(record);
                            setIsUpdate(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchData = async () => {
        try {
            const result = await getAllStudyFrame();
            if (result.status === 200) {
                const dataResult = result.data.data.map((item) => {
                    return {
                        ...item,
                        majorName: item.major.majorName,
                        majorId: item.major.majorId,
                        cycleName: item.cycle.cycleName,
                        cycleId: item.cycle.cycleId,
                    }
                })
                setData(dataResult);
                setDataOriginal(dataResult);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleDelete = async () => {
        try {
            const checkUsed = await checkRelatedData(selectedRowKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteStudyFrames(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchData();
                setSelectedRowKeys([]); // Xóa các ID đã chọn

                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - KhungCTDT - handleDelete - Error]:', error);
        }
    };


    const khungCTDTUpdateMemoized = useMemo(() => {
        return (
            <KhungCTDTUpdate
                title={'khung đào tạo'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    const dungKhungCTDTMemoized = useMemo(() => {
        return (
            <DungKhungCTDTUpdate
                showModal={showModalBuildFrame}
                setShowModal={setShowModalBuildFrame}
                buildFrameData={buildFrameData}
            />
        );
    }, [showModalBuildFrame]);

    const filterFields = [
        <FormItem
            name="frameId"
            label="Mã khung đào tạo"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="frameName"
            label="Tên khung đào tạo"
        >
            <Input />
        </FormItem>,
        <FormItem name="major" label="Ngành">
            <Select
                showSearch
                placeholder="Chọn ngành"
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={majorOptions}
            />
        </FormItem>,
        <FormItem
            name="cycle"
            label="Chu kỳ"
        >
            <Select
                showSearch
                placeholder="Chọn chu kỳ"
                optionFilterProp="children"
                labelInValue // Hiển thị label trên input
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={cycleOptions}
            />
        </FormItem>
    ]

    const onSearch = (values) => {
        const { frameId, frameName, major, cycle } = values;
        const originalList = dataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesFrameId = frameId ? item.frameId?.toLowerCase().includes(frameId.toLowerCase()) : true;
            const matchesFrameName = frameName ? item.frameName?.toLowerCase().includes(frameName.toLowerCase()) : true;
            const matchesmajor = major ? item.majorId === major : true;
            const matchesCycle = cycle?.value ? item.cycle?.cycleId === cycle?.value : true;

            return matchesFrameId && matchesFrameName && matchesmajor && matchesCycle;
        });
        setData(filteredList);
    };


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Khung đào tạo</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }}
                    />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => deleteConfirm('khối kiến thức', handleDelete)}
                        isVisible={permissionDetailData?.isDelete}
                    />
                </div>
            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={filterFields}
                    onSearch={onSearch}
                    onReset={fetchData}
                />
                <Divider />
            </div>
            <TableCustomAnt
                height={'350px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange={"frameId"}
            />
            {khungCTDTUpdateMemoized}
            {dungKhungCTDTMemoized}

        </div>
    );
}

export default KhungCTDT;
