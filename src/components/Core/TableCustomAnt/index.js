import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';
import { useRef, useState } from 'react';

const cx = classNames.bind(styles);

function TableCustomAnt({
    height = '290px',
    columns,
    data,
    width = '100%',
    isOutline = false,
    setSelectedRowKeys,
    selectedRowKeys,
    keyIdChange,
    loading
}) {
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
            setSelectedRowKeys(newSelectedRowKeys);

            // Nếu key để xóa không phải id => VD: scientificResearchId - Truyền key để xóa vào keyIdChange
            if (keyIdChange) {
                const selectedIds = selectedRows.map(row => row[keyIdChange]);
                setSelectedRowKeys(selectedIds);
            }

        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User', // Disable row nếu cần thiết
            name: record.name,
        }),
    };

    return (
        <div
            className={cx('container-crud')}
            style={{
                width: width,
                border: isOutline ? '2.5px solid var(--blue-100)' : 'none',
                boxShadow: isOutline ? 'var(--box-shadow-1)' : 'none',
            }}
        >
            {isOutline ? <h2>Danh sách năm học</h2> : null}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data.map((item, index) => ({
                    ...item,
                    key: item.id || index,
                }))}
                showSorterTooltip={{
                    target: 'sorter-icon',
                }}
                scroll={{
                    y: height,
                }}
                loading={loading}
            />
        </div>
    );
}

export default TableCustomAnt;

