import classNames from 'classnames/bind';
import styles from './KhungCTDT.module.scss';
import Table from '../../../../components/Table';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import Button from '../../../../components/Core/Button';
import { Collapse, Divider, Segmented } from 'antd';
import TransferCustom from '../../../../components/Core/TransferCustom';
import { useContext, useEffect, useState } from 'react';
import { getWhere } from '../../../../services/majorService';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';

const cx = classNames.bind(styles);

const columns = [
    {
        dataIndex: 'mahp',
        title: 'Mã HP',
    },
    {
        dataIndex: 'tenhp',
        title: 'Tên học phần',
    },
    {
        dataIndex: 'sotc',
        title: 'Số tín chỉ',
    },
    {
        dataIndex: 'mahp_before',
        title: 'Mã HP trước',
    },
];

const data1 = [
    {
        key: '1',
        mahp: '861301',
        tenhp: 'Triết học Mác - Lênin',
        sotc: 3,
        mahp_before: '',
    },
    {
        key: '2',
        mahp: '861302',
        tenhp: 'Kinh tế chính trị Mác - Lênin',
        sotc: 2,
        mahp_before: '861301',
    },
    {
        key: '3',
        mahp: '861303',
        tenhp: 'Chủ nghĩa xã hội khoa học',
        sotc: 2,
        mahp_before: '861302',
    },
    {
        key: '4',
        mahp: '861304',
        tenhp: 'Tư tưởng Hồ Chí Minh',
        sotc: 2,
        mahp_before: '861303',
    },
    {
        key: '5',
        mahp: '861305',
        tenhp: 'Lịch sử Đảng Cộng sản Việt Nam',
        sotc: 2,
        mahp_before: '861303',
    },
];

const data2 = [
    {
        key: '1',
        mahp: 'BOBA11',
        tenhp: 'Bóng bàn 1',
        sotc: 1,
        mahp_before: '862101',
    },
    {
        key: '2',
        mahp: 'BOBA11',
        tenhp: 'Bóng bàn 2',
        sotc: 1,
        mahp_before: '862101',
    },
];

const data3 = [
    {
        key: '1',
        mahp: '841405',
        tenhp: 'Xác suất thống kê',
        sotc: 3,
        mahp_before: '',
    },
    {
        key: '2',
        mahp: '861401',
        tenhp: 'Giải tích 1',
        sotc: 3,
        mahp_before: '',
    },
    {
        key: '3',
        mahp: '861406',
        tenhp: 'Giải tích 2',
        sotc: 3,
        mahp_before: '861401',
    },
    {
        key: '4',
        mahp: '861402',
        tenhp: 'Đại số tuyến tính',
        sotc: 3,
        mahp_before: '',
    },
    {
        key: '5',
        mahp: '841020',
        tenhp: 'Cơ sở lập trình',
        sotc: 3,
        mahp_before: '',
    },
];


function KhungCTDT() {
    const { facultyId } = useContext(AccountLoginContext);
    const [listMajor, setListMajor] = useState([]);

    const fetchMajors = async () => {
        try {
            const response = await getWhere({ facultyId: facultyId })
            if (response.status === 200) {

            }

        } catch (error) {

        }
    }
    useEffect(() => {
        fetchMajors();
    }, [])
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>

                    <h3 className={cx('title')}>Chương trình đào tạo</h3>
                </div>
                <Button primary small>
                    Lưu
                </Button>
            </div>
            <Divider orientation="left">Khối kiến thức giáo dục đại cương</Divider>
            <Collapse
                bordered={false}
                items={[
                    {
                        key: '1',
                        label: 'Các học phần bắt buộc',
                        children: <TransferCustom data={data1} columns={columns} />,
                    },
                ]}
            />
            <Collapse
                bordered={false}
                items={[
                    {
                        key: '2',
                        label: 'Các học phần tự chọn',
                        children: <TransferCustom data={data2} columns={columns} />,
                    },
                ]}
            />
            <Divider orientation="left">Khối kiến thức chuyên nghiệp</Divider>
            <Segmented size="large" options={['Kiến thức cơ sở ngành', 'Kiến thức ngành', 'Kiến thức chuyên ngành']} block />
            <Segmented size="large" options={['Kiến thức cơ sở ngành', 'Kiến thức ngành', 'Kiến thức chuyên ngành']} block />
            <Collapse
                bordered={false}
                items={[
                    {
                        key: '1',
                        label: 'Các học phần bắt buộc',
                        children: <TransferCustom data={data3} columns={columns} />,
                    },
                ]}
            />
            <Collapse
                bordered={false}
                items={[
                    {
                        key: '2',
                        label: 'Các học phần tự chọn',
                        children: <TransferCustom data={data1} columns={columns} />,
                    },
                ]}
            />
            <div className={cx('title-namhoc-sapxep')}>
                <h3>Sắp xếp học kì thực hiện</h3>
            </div>
            <Table department={true} />
        </div>
    );
}

export default KhungCTDT;
