import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';

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
    loading,
    isHaveRowSelection = true,
    isPagination = true,
}) {
    const onSelectChange = (newSelectedRowKeys, selectedRows) => {
        // Nếu key để xóa không phải id => VD: scientificResearchId - Truyền key để xóa vào keyIdChange
        if (keyIdChange) {
            const selectedIds = selectedRows.map(row => row[keyIdChange]);
            setSelectedRowKeys(selectedIds);
        } else {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };


    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
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
                rowSelection={isHaveRowSelection ? rowSelection : null}
                columns={columns}
                dataSource={data.map((item) => {
                    const key = item.id || item[keyIdChange];
                    return {
                        ...item,
                        key: key,
                    };
                })}
                showSorterTooltip={{
                    target: 'sorter-icon',
                }}
                scroll={{
                    y: height,
                }}
                loading={loading}
                pagination={isPagination}
            />
        </div>
    );
}

export default TableCustomAnt;

