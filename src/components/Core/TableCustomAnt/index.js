import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';
import { useState } from 'react';

const cx = classNames.bind(styles);

const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
        disabled: record.name === 'Disabled User',
        // Column configuration not to be checked
        name: record.name,
    }),
};

function TableCustomAnt({
    height = '290px',
    columns,
    data,
    width = '100%',
    isOutline = false,
    setSelectedRowKeys,
    selectedRowKeys,
}) {
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${newSelectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelectedRowKeys(newSelectedRowKeys); // Cập nhật selectedRowKeys
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    };
    const [checkStrictly, setCheckStrictly] = useState(false);
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
                rowSelection={{
                    ...rowSelection,
                    checkStrictly,
                }}
                columns={columns}
                dataSource={data}
                showSorterTooltip={{
                    target: 'sorter-icon',
                }}
                scroll={{
                    y: height,
                }}
            />
        </div>
    );
}

export default TableCustomAnt;
