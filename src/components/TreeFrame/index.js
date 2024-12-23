import { Empty, Spin, Tree } from 'antd';
import classNames from 'classnames/bind';
import styles from "./TreeFrame.module.scss"


const cx = classNames.bind(styles)

const TreeFrame = ({
    treeData, // Dữ liệu cấu trúc cây
    setTreeData, // Set dữ liệu cấu trúc cây
    expandedKeys, // Key để mở rộng khối kiến thức
    isLoading,
    draggable = true,
    height = "auto",
    ...props
}) => {


    const onDrop = (info) => {
        const { node, dragNode, dropPosition, dropToGap } = info;
        const dropKey = node.key;
        const dragKey = dragNode.key;

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };

        const data = [...treeData];
        let dragObj;

        // Loại bỏ phần tử được kéo ra khỏi cây
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!dropToGap) {
            // Thêm phần tử được kéo vào danh sách con của phần tử đích
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else {
            // Thêm phần tử được kéo vào khoảng cách giữa các phần tử
            let ar = [];
            let i;
            loop(data, dropKey, (_item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        // Cập nhật orderNo cho tất cả phần tử ở cùng cấp
        let currentOrderNo = 1; // Biến theo dõi thứ tự hiện tại

        const updateOrderNo = (items) => {
            items.forEach((item) => {
                item.orderNo = currentOrderNo++; // Cập nhật thứ tự dựa trên vị trí hiện tại
                if (item.children && item.children.length > 0) {
                    updateOrderNo(item.children); // Đệ quy cho các phần tử con
                }
            });
        };

        // Cập nhật parentFrameId cho tất cả các phần tử
        const updateParentFrameId = (items, parentId = null) => {
            items.forEach(item => {
                item.studyFrameComponentParentId = parentId;
                if (item.children && item.children.length > 0) {
                    updateParentFrameId(item.children, item.studyFrameComponentId); // Đệ quy cho các phần tử con
                }
            });
        };

        updateOrderNo(data); // Cập nhật orderNo cho cây sau khi kéo thả
        updateParentFrameId(data); // Cập nhật parentFrameId cho cây sau khi kéo thả

        setTreeData(data);
    };


    return (
        isLoading
            ?
            <div className={('container-loading')}>
                <Spin size="large" />
            </div>
            :
            <>
                {(treeData.length === 0)
                    ? <Empty className={cx("empty")} description="Không có dữ liệu" />
                    : <>
                        <Tree
                            checkStrictly
                            className="draggable-tree"
                            expandedKeys={expandedKeys}
                            draggable={draggable}
                            blockNode
                            onDrop={onDrop}
                            treeData={treeData}
                            height={height}
                            {...props}
                        />
                    </>
                }
            </>
    );
};

export default TreeFrame;
