import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { Table } from 'antd';
import { useState } from 'react';

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
    isHideSTT = false,
    ...props
}) {
    // State để lưu trạng thái phân trang
    const [paginationState, setPaginationState] = useState({
        current: 1,
        pageSize: 10,
    });

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
                    render: (text, record, index) => {
                        const { current, pageSize } = paginationState;
                        return (current - 1) * pageSize + index + 1;
                    },
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
                pagination={
                    isPagination
                        ? {
                            current: paginationState.current,
                            pageSize: paginationState.pageSize,
                            total: data.length, // Tổng số dòng
                            onChange: (page, pageSize) => {
                                setPaginationState({ current: page, pageSize });
                            },
                        }
                        : false // Không phân trang nếu `isPagination` là false
                }
                {...props}
            />
        </div>
    );
}

export default TableCustomAnt;

