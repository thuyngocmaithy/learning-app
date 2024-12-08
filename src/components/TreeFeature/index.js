import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Tree } from 'antd';
import { getAll } from '../../services/featureService';
import classNames from 'classnames/bind';
import styles from "./TreeFeature.module.scss"
import Button from '../Core/Button';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import ChucNangUpdate from '../FormUpdate/ChucNangUpdate';
import { useLocation } from 'react-router-dom';
import config from '../../config';
import { PermissionDetailContext } from '../../context/PermissionDetailContext';

const cx = classNames.bind(styles)

const TreeFeature = ({ treeData, setTreeData, setSelectedFeature, reLoad, setShowModalDetail }) => {
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [expandedKeys, setExpandedKeys] = useState([]);
    const [showModalFeature, setShowModalFeature] = useState(false);
    const [isUpdateFeature, setIsUpdateFeature] = useState(false);
    const [isLoadingFeature, setIsLoadingFeature] = useState(true);

    const buildTreeData = useCallback((list, parentId = null) => {
        return list
            .filter(item => item.parent?.featureId === parentId || (!item.parent && parentId === null))
            .sort((a, b) => a.orderNo - b.orderNo)
            .map(item => ({
                title: <div className={cx("item-feature")}>
                    <div className={cx("title-item")}>
                        <p className={cx("featureId")}>{item.featureId}</p>
                        <p className={cx("_")}>-</p>
                        <p className={cx("featureName")}>{item.featureName}</p>
                    </div>
                    <div className={cx("option")}>
                        <Button className={cx('btnDetail')} leftIcon={<EyeOutlined />} outline verysmall onClick={() => { setShowModalDetail(item) }}>
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
                            disabled={!permissionDetailData?.isEdit}
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
    }, [permissionDetailData, setShowModalDetail]);

    const fetchData = useCallback(async () => {
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
    }, [buildTreeData, setTreeData]);

    useEffect(() => {
        if (reLoad) {
            fetchData();
        }
    }, [fetchData, reLoad]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


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
    }, [isUpdateFeature, showModalFeature, fetchData]);

    const onCheck = (checkedKeys) => {
        setSelectedFeature(checkedKeys)
    };

    return (
        <>
            <Tree
                checkable
                checkStrictly
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
