import classNames from 'classnames/bind';
import styles from './TableCustomAnt.module.scss';
import { List, Table } from 'antd';
import { useEffect, useState } from 'react';

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
    size,
    ...props
}) {
    // State để lưu trạng thái phân trang
    const [paginationState, setPaginationState] = useState({
        current: 1,
        pageSize: 10,
    });
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }

        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
                    width: '5rem',
                    render: (text, record, index) => {
                        const { current, pageSize } = paginationState;
                        return (current - 1) * pageSize + index + 1;
                    },
                },
            ]),
        ...columns // Các cột khác
    ];

    // Hiển thị List khi màn hình nhỏ hơn 768px
    if (screenWidth < 768) {
        return (
            <List
                className={cx('list-container-table-custom-ant')}
                dataSource={data}
                renderItem={(item, index) => (
                    <List.Item
                        key={item.id || item[keyIdChange]}
                        actions={columnsWithSTT.map((col) => {
                            if (col.key === 'action') {
                                // Xử lý riêng cột Action
                                return (
                                    <div key={col.key} className={cx('list-item-action')}>
                                        {col.render
                                            ? col.render(null, item, index) // Gọi hàm render với record
                                            : null}
                                    </div>
                                );
                            }
                        })}
                    >
                        <div className={cx('list-item')}>
                            {/* Hiển thị các cột thông thường */}
                            {columnsWithSTT.map((col) => {
                                if (col.key !== 'action') {
                                    return (
                                        <div key={col.key || col.dataIndex}>
                                            <strong>{col.title}: </strong>
                                            {
                                                col.render
                                                    ? col.render(
                                                        item[col.dataIndex],
                                                        item,
                                                        index
                                                    )
                                                    : item[col.dataIndex]
                                            }
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </ List.Item >
                )}
            />
        );
    }

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
                scroll={height !== null ? { y: height } : null}
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
                size={
                    size
                        ? size
                        : screenWidth < 768
                            ? "small"
                            : "middle"
                }
                locale={{
                    emptyText: 'No data available',
                }}
                {...props}
            />
        </div>
    );
}

export default TableCustomAnt;

