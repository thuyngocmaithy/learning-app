import React, { useState, useEffect, useMemo } from 'react';
import { Tree } from 'antd';
import { getAll } from '../../services/featureService';
import classNames from 'classnames/bind';
import styles from "./TreeFeature.module.scss"
import Button from '../Core/Button';
import { EditOutlined } from '@ant-design/icons';
import ChucNangUpdate from '../FormUpdate/ChucNangUpdate';

const cx = classNames.bind(styles)



const TreeFeature = ({ treeData, setTreeData, setSelectedFeature, reLoad }) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [showModalFeature, setShowModalFeature] = useState(false);
    const [isUpdateFeature, setIsUpdateFeature] = useState(false);
    const [isLoadingFeature, setIsLoadingFeature] = useState(true);

    const buildTreeData = (list, parentId = null) => {
        return list
            .filter(item => item.parent?.featureId === parentId || (!item.parent && parentId === null))
            .sort((a, b) => a.orderNo - b.orderNo)
            .map(item => ({
                title: <div className={cx("item-feature")}>
                    <p>{item.featureName}</p>
                    <div className={cx("option")}>
                        <Button className={cx('btnDetail')} leftIcon={<EditOutlined />} outline verysmall>
                            Chi tiết
                        </Button>
                        <Button
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                setShowModalFeature({
                                    featureId: item.featureId,
                                    featureName: item.featureName,
                                    keyRoute: item.keyRoute,
                                    icon: item.icon,
                                    parentFeatureId: item.parent?.featureId,
                                });
                                setIsUpdateFeature(true);
                            }}
                        >
                            Sửa
                        </Button>
                    </div>
                </div>,
                key: item.featureId,
                orderNo: item.orderNo,
                featureId: item.featureId,
                featureName: item.featureName,
                keyRoute: item.keyRoute,
                icon: item.icon,
                parentFeatureId: item.parent ? item.parent.featureId : null,
                children: buildTreeData(list, item.featureId),
            }));
    };
    const fetchData = async () => {
        try {
            const response = await getAll();
            if (response.status === 200) {
                const tree = buildTreeData(response.data.data);
                setTreeData(tree);
            }
        } catch (error) {
            console.error(error);
        }
        finally {
            setIsLoadingFeature(false)
        }
    };
    useEffect(() => {
        fetchData();
    }, [reLoad]);


    const onDrop = (info) => {
        const { node, dragNode, dropPosition, dropToGap } = info;
        const dropKey = node.key;
        const dragKey = dragNode.key;

        // const findNode = (data, key) => {
        //     for (const item of data) {
        //         if (item.key === key) return item;
        //         if (item.children) {
        //             const result = findNode(item.children, key);
        //             if (result) return result;
        //         }
        //     }
        //     return null;
        // };

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
        const updateOrderNo = (items) => {
            items.forEach((item, index) => {
                item.orderNo = index + 1; // Cập nhật thứ tự dựa trên vị trí mới
                if (item.children && item.children.length > 0) {
                    updateOrderNo(item.children); // Đệ quy cho các phần tử con
                }
            });
        };

        // Cập nhật parentFeatureId cho tất cả các phần tử
        const updateParentFeatureId = (items, parentId = null) => {
            items.forEach(item => {
                item.parentFeatureId = parentId;
                if (item.children && item.children.length > 0) {
                    updateParentFeatureId(item.children, item.key); // Đệ quy cho các phần tử con
                }
            });
        };

        updateOrderNo(data); // Cập nhật orderNo cho cây sau khi kéo thả
        updateParentFeatureId(data); // Cập nhật parentFeatureId cho cây sau khi kéo thả

        setTreeData(data);
    };

    const chucNangUpdateMemoized = useMemo(() => {
        return (
            <ChucNangUpdate
                title={'chức năng'}
                isUpdate={isUpdateFeature}
                showModal={showModalFeature}
                setShowModal={setShowModalFeature}
                reLoad={fetchData}
            />
        );
    }, [showModalFeature, isUpdateFeature]);

    const onCheck = (checkedKeys) => {
        setSelectedFeature(checkedKeys)
    };

    return (
        <>
            <Tree
                checkable
                className="draggable-tree"
                expandedKeys={expandedKeys}
                draggable
                blockNode
                onDrop={onDrop}
                treeData={treeData}
                onExpand={keys => setExpandedKeys(keys)}
                loadData={isLoadingFeature}
                onCheck={onCheck}
            />
            {chucNangUpdateMemoized}
        </>
    );
};

export default TreeFeature;
