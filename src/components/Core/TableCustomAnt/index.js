import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';

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
    showModalUpdated,
    handleCustom,
    width = '100%',
    isOutline = false,
}) {
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
                    type: 'checkbox',
                    ...rowSelection,
                }}
                columns={handleCustom ? columns(showModalUpdated, handleCustom) : columns(showModalUpdated)}
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
