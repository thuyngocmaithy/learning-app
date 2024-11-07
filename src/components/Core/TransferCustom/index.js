import { Transfer, Table, Flex } from 'antd';
import { useState } from 'react';

function TransferCustom({ data, columns, targetObjects, setTargetObjects, ...props }) {
    // Hàm lọc cho Transfer => Tìm kiếm các mục dựa trên input
    const filterOption = (input, item) => item.title?.includes(input) || item.tag?.includes(input);

    // Hàm xử lý khi thay đổi target objects (truyền object thay vì key)
    const onChange = (nextTargetKeys) => {
        const selectedObjects = data.filter(item => nextTargetKeys.includes(item.key));
        setTargetObjects(selectedObjects);
    };

    // Lấy danh sách key từ targetObjects để truyền vào Transfer component
    const targetKeys = targetObjects?.map(item => item.key);

    // Component TableTransfer sử dụng Transfer và Table của antd
    const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
        <Transfer {...restProps} showSelectAll={false}>
            {({
                direction, // Xác định hướng
                filteredItems, // Các mục đã được lọc
                onItemSelect, // Hàm xử lý chọn mục
                onItemSelectAll,
                selectedKeys: listSelectedKeys, // Quản lý trạng thái chọn
                disabled: listDisabled, // Vô hiệu hóa
            }) => {
                const columns = direction === 'left' ? leftColumns : rightColumns;
                const rowSelection = {
                    // Định nghĩa cách chọn hàng trong bảng
                    onSelectAll(selected, selectedRows) {
                        const treeSelectedKeys = selectedRows.map(({ key }) => key);
                        onItemSelectAll(treeSelectedKeys, selected);
                    },
                    onSelect({ key }, selected) {
                        onItemSelect(key, selected);
                    },
                    selectedRowKeys: listSelectedKeys,
                };
                return (
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredItems}
                        size="small"
                        style={{
                            pointerEvents: listDisabled ? 'none' : undefined,
                        }}
                        onRow={({ key, disabled: itemDisabled }) => ({
                            onClick: () => {
                                if (itemDisabled || listDisabled) {
                                    return;
                                }
                                onItemSelect(key, !listSelectedKeys.includes(key));
                            },
                        })}
                        scroll={{
                            y: '350px',
                        }}
                    />
                );
            }}
        </Transfer>
    );

    return (
        <Flex flexdirection="column" alignitems="flex-start" gap="1rem" style={{ justifyContent: 'space-around', display: 'block' }}>
            <TableTransfer
                dataSource={data}
                targetKeys={targetKeys}  // Chuyển đổi từ objects sang keys
                showSearch
                onChange={onChange}
                filterOption={filterOption}
                leftColumns={columns}
                rightColumns={columns}
                {...props}
            />
        </Flex>
    );
}

export default TransferCustom;
