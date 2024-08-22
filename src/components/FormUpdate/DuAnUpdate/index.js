import React, { useRef, useState, memo, useMemo, useEffect, useCallback } from 'react';
import { Input, InputNumber, Select } from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';

const DuAnUpdate = memo(function DuAnUpdate({ title, isUpdate, showModal, setShowModal, openNotification, reLoad }) {
    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };
    const handleChangeSelect = (value) => {
        console.log(`selected ${value}`);
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            // onUpdate={handleUpdate}
        >
            <FormItem label={'Tên đề tài'}>
                <Input />
            </FormItem>
            <FormItem label={'Khoa'}>
                <Select
                    onChange={handleChangeSelect}
                    options={[
                        {
                            value: 'CNTT',
                            label: 'CNTT',
                        },
                        {
                            value: 'Kế toán',
                            label: 'Kế toán',
                        },
                        {
                            value: 'Tài chính - ngân hàng',
                            label: 'Tài chính - ngân hàng',
                        },
                    ]}
                />
            </FormItem>
            <FormItem label={'Chủ nhiệm đề tài'}>
                <Input />
            </FormItem>
            <FormItem label={'Số lượng thành viên'}>
                <InputNumber style={{ width: '100%' }} min={1} max={10} step={1} />
            </FormItem>
        </Update>
    );
});

export default DuAnUpdate;
