import React, { useState, useEffect } from 'react';
import { Tree } from 'antd';
import { getAll } from '../../services/featureService';

const buildTreeData = (list, parentId = null) => {
    return list
        .filter(item => item.parent?.featureId === parentId || (!item.parent && parentId === null))
        .map(item => ({
            title: item.featureName,
            key: item.featureId,
            children: buildTreeData(list, item.featureId),
        }));
};

const TreeFeature = () => {
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Giả sử getAll là hàm gọi API của bạn
                const response = await getAll();
                if (response.status === 200) {
                    const data = response.data.data;
                    const tree = buildTreeData(data);
                    setTreeData(tree);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const onDragEnter = (info) => {
        // Xử lý sự kiện khi kéo vào một node khác
        console.log('onDragEnter', info);
    };

    const onDrop = (info) => {
        const { node, dragNode, dropPosition, dropToGap } = info;
        const dropKey = node.key;
        const dragKey = dragNode.key;

        const findNode = (data, key) => {
            for (const item of data) {
                if (item.key === key) return item;
                if (item.children) {
                    const result = findNode(item.children, key);
                    if (result) return result;
                }
            }
            return null;
        };

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

        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!dropToGap) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else {
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

        setTreeData(data);
    };

    return (
        <Tree
            className="draggable-tree"
            expandedKeys={expandedKeys}
            draggable
            blockNode
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            treeData={treeData}
            onExpand={keys => setExpandedKeys(keys)}
        />
    );
};

export default TreeFeature;
