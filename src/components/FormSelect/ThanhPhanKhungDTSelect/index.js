import React, { memo, useEffect, useState } from 'react';
import FormSelect from '../../Core/FormSelect';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { getAllStudyFrameComponent } from '../../../services/studyFrameCompService';

const ThanhPhanKhungDTFormSelect = memo(function ThanhPhanKhungDTFormSelect({
    title,
    isFormSelect,
    showModal,
    setShowModal,
    selectedItem,
    setSelectedItem,
    setReceiveFormSelect,
    reLoad
}) {
    const [dataFrameComponent, setDataFrameComponent] = useState([])
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSelect = async () => {
        try {
            setSelectedItem(selectedRowKeys)
            setShowModal(false);
            setReceiveFormSelect(true);
        } catch (error) {
            console.log(error);
        }
    };

    // Lấy data cho bảng thành phần khung đào tạo
    const fetchData = async () => {
        try {
            const result = await getAllStudyFrameComponent();
            if (result.status === 200) {
                setDataFrameComponent(result.data.data.map(item => {
                    return {
                        ...item,
                        majorId: item.major?.majorId,
                        majorName: item.major?.majorName
                    }
                }
                ));

                // Set các thành phần khung đào tạo đã có trong db
                setSelectedRowKeys(selectedItem);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedItem]);


    const columns = [
        {
            title: 'Mã thành phần khung đào tạo',
            dataIndex: 'frameComponentId',
            key: 'frameComponentId',
        },
        {
            title: 'Tên thành phần khung',
            dataIndex: 'frameComponentName',
            key: 'frameComponentName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'creditHour',
            key: 'creditHour',
        }
    ];

    return (
        <FormSelect
            title={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onSelect={handleSelect}
        >
            <TableCustomAnt
                height={'370px'}
                columns={columns}
                data={dataFrameComponent}
                setSelectedRowKeys={setSelectedRowKeys}
                selectedRowKeys={selectedRowKeys}
                loading={isLoading}
                size={"small"}
            />
        </FormSelect>
    );
});

export default ThanhPhanKhungDTFormSelect;

