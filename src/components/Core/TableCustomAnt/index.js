import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';

const cx = classNames.bind(styles);

function TableCustomAnt({
    height = '290px',
    columns,
    data,
    width = '100%',
    setSelectedRowKeys,
    selectedRowKeys,
    keyIdChange,
    loading,
    isHaveRowSelection = true,
    isPagination = true,
    isHideSTT = false
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

    const columnsWithSTT = [
        ...(isHideSTT
            ? []
            : [
                {
                    title: 'STT',
                    dataIndex: 'index',
                    key: 'stt',
                    width: '70px',
                    render: (text, record, index) => index + 1,
                },
            ]),
        ...columns // Các cột khác
    ];

    return (
        <div
            className={cx('container-crud')}
            style={{
                width: width,
            }}
        >
            <Table
                rowSelection={isHaveRowSelection ? rowSelection : null}
                columns={columnsWithSTT}
                dataSource={data.map((item) => {
                    const key = item.id || item[keyIdChange];
                    return {
                        ...item,
                        key: key
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

