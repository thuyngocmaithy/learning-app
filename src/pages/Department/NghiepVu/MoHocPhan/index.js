import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, Input, InputNumber, Progress, Segmented } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/Table';
import { useState } from 'react'; //
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import Toolbar from '../../../../components/Core/Toolbar';
import Update from '../../../../components/Core/Update';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import { Tag } from 'antd';
import { EditOutlined, FormOutlined } from '@ant-design/icons';
import FormItem from '../../../../components/Core/FormItem';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

const columns = (showModalUpdated, handleArrange) => [
    {
        title: 'Năm học',
        dataIndex: 'NH',
        key: 'NH',
        width: '30%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.NH - b.NH,
        filters: [
            {
                text: '2020',
                value: '2020',
            },
            {
                text: '2021',
                value: '2021',
            },
            {
                text: '2022',
                value: '2022',
            },
        ],
        onFilter: (value, record) => record.NH.indexOf(value) === 0,
    },
    {
        title: 'Tiến độ',
        key: 'tags',
        width: '30%',
        dataIndex: 'tags',
        render: (_, { tags }) => (
            <>
                {tags.map((tag) => {
                    let color = tag === 'Đã sắp xếp' ? 'green' : 'red';
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
        filters: [
            {
                text: 'Đã sắp xếp',
                value: 'Đã sắp xếp',
            },
            {
                text: 'Chưa sắp xếp',
                value: 'Chưa sắp xếp',
            },
        ],
        onFilter: (value, record) => record.tags.indexOf(value) === 0,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <div className={cx('action-item')}>
                <ButtonCustom
                    className={cx('btnEdit')}
                    leftIcon={<EditOutlined />}
                    outline
                    verysmall
                    onClick={() => showModalUpdated(record.NH)}
                >
                    Sửa
                </ButtonCustom>
                <ButtonCustom
                    className={cx('btnArrange')}
                    leftIcon={<FormOutlined />}
                    primary
                    verysmall
                    onClick={() => handleArrange(record.NH)}
                >
                    Sắp xếp
                </ButtonCustom>
            </div>
        ),
    },
];

const data = [
    {
        key: '1',
        NH: '2020',
        tags: ['Đã sắp xếp'],
    },
    {
        key: '2',
        NH: '2021',
        tags: ['Chưa sắp xếp'],
    },
    {
        key: '3',
        NH: '2022',
        tags: ['Đã sắp xếp'],
    },
];

function MoHocPhan() {
    const [NHUpdated, setNHUpdated] = useState(''); // Trạng thái để lưu giá trị năm học hiện tại
    const [showModalAdd, setShowModalAdd] = useState(false); //hiển thị model add
    const [showModalUpdated, setShowModalUpdated] = useState(false); // hiển thị model updated

    // Trạng thái để lưu giá trị năm học nhập vào
    const [inputValueNH, setInputValueNH] = useState('');

    // Hàm xử lý thay đổi giá trị năm học
    const handleInputChange = (e) => {
        setInputValueNH(e.target.value);
    };

    // Hàm xử lý khi nhấn nút Reset
    const handleReset = () => {
        setInputValueNH('');
    };

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModalAdd) {
            setShowModalAdd(false);
        }
        if (showModalUpdated) {
            setShowModalUpdated(false);
        }
    };
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    return (
        <div className={cx('mohocphan-wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Mở học phần</h3>
                </div>
                {/* Truyền hàm setShowModalAdd vào Toolbar */}
                <div className={cx('wrapper')}>
                    <Toolbar type={'Tạo mới'} onClick={() => setShowModalAdd(true)} />
                    <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('năm học')} />
                    <Toolbar type={'Nhập file Excel'} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>
            </div>
            <div className={cx('container-manage-NH')}>
                <div className={cx('container-table')}>
                    <div className={cx('select-time')}>
                        <h4>Năm học</h4>
                        {/* Input hiển thị giá trị năm học hiện tại */}
                        <Input value={inputValueNH} onChange={handleInputChange} style={{ width: '80px' }} readOnly />
                        {/* Nút Reset để xóa giá trị năm học */}
                        <ButtonCustom outline small onClick={handleReset}>
                            Reset
                        </ButtonCustom>
                    </div>
                    <div className={cx('arrange')}>
                        {inputValueNH !== '' ? (
                            <>
                                {/* Hiển thị bảng nếu có năm học */}
                                <TableHP department={true} />
                                <div className={cx('footer-table')}>
                                    <ButtonCustom primary small className={cx('btnSave')}>
                                        Lưu
                                    </ButtonCustom>
                                </div>
                            </>
                        ) : (
                            // Hiển thị thông báo khi không chọn năm học
                            <Empty description="Bạn chưa chọn năm học sắp xếp" />
                        )}
                    </div>
                </div>
                {/* TABLE MANAGE NĂM HỌC */}
                <TableCustomAnt
                    columns={columns(setShowModalUpdated, setInputValueNH)}
                    data={data}
                    // handleCustom={setInputValueNH}
                    width={'40%'}
                    isOutline={true}
                />
            </div>
            <Progress
                percent={80}
                percentposition={{
                    align: 'start',
                    type: 'outer',
                }}
                size={['100%', 15]}
            />
            {/* Modal để thêm năm học */}
            <Update
                title="năm học"
                showModalAdd={showModalAdd}
                showModalUpdated={showModalUpdated}
                onClose={handleCloseModal}
            >
                <FormItem label={'Năm học'}>
                    <InputNumber
                        style={{ marginLeft: '20px', width: '100%' }}
                        min={2020}
                        max={2030}
                        value={showModalUpdated ? NHUpdated : ''}
                        step={1}
                    />
                </FormItem>
            </Update>
        </div>
    );
}

export default MoHocPhan;
