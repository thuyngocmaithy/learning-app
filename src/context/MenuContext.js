import React, { createContext, useContext, useEffect, useState } from 'react';
import { getById } from '../services/featureService';
import { getWhere } from '../services/permissionFeatureService';
import listIcon from '../assets/icons/listIconAnt';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import routes from '../config/routes';
import { AccountLoginContext } from './AccountLoginContext';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const navigate = useNavigate();
    const { permission } = useContext(AccountLoginContext);
    const [menu, setMenu] = useState([]);


    const fetchParentData = async (parentId) => {
        try {
            const response = await getById(parentId);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    };


    const buildTreeData = async (list) => {
        const treeData = [];
        const parentCache = {}; // Cache để tránh gọi fetchParentData nhiều lần cho cùng một parentId    

        // Sắp xếp danh sách theo orderNo
        const sortedList = list.sort((a, b) => a.feature.orderNo - b.feature.orderNo);

        function findNodeByFeatureId(treeData, featureId) {
            for (const node of treeData) {
                if (node.featureid === featureId) {
                    return node;
                }
                if (node.children) {
                    const foundNode = findNodeByFeatureId(node.children, featureId);
                    if (foundNode) {
                        return foundNode;
                    }
                }
            }
            return null; // Không tìm thấy node với featureId
        }
        for (const item of sortedList) {
            const { feature } = item;

            const parentId = feature.parent?.featureId;

            if (parentId) {
                // Nếu có parentId, gọi hàm fetchParentData để lấy chức năng cha
                let parentFeature = parentCache[parentId];
                if (!parentFeature) {
                    parentFeature = await fetchParentData(parentId);
                    parentCache[parentId] = parentFeature;
                }

                if (parentFeature) {
                    // Kiểm tra nếu đã có cha trong treeData
                    let parentNode = findNodeByFeatureId(treeData, parentFeature.featureId);

                    const IconComponentParent = parentFeature.icon ? listIcon[parentFeature.icon] : null;
                    if (!parentNode) { //Tạo object cha
                        parentNode = {
                            label: parentFeature.featureName,
                            icon: parentFeature.icon ? <IconComponentParent /> : <MenuOutlined />,
                            key: config.routes[parentFeature.keyRoute],
                            featureid: parentFeature.featureId,
                            orders: parentFeature.orderNo,
                            children: [],
                        };
                        treeData.push(parentNode);
                    }

                    const IconComponentChildren = feature.icon ? listIcon[feature.icon] : null;
                    // Thêm chức năng con vào danh sách children của cha
                    parentNode.children.push({
                        label: <Link to={config.routes[feature.keyRoute]} onClick={handleClickA}>{feature.featureName}</Link>,
                        key: config.routes[feature.keyRoute],
                        featureid: feature.featureId,
                        icon: feature.icon ? <IconComponentChildren /> : <MenuOutlined />,
                        orders: feature.orderNo,
                        children: [],
                    });

                }
            } else {
                const IconComponentFree = feature.icon ? listIcon[feature.icon] : null;
                // Nếu không có cha, thêm vào treeData như là chức năng cấp cao nhất
                treeData.push({
                    key: config.routes[feature.keyRoute],
                    featureid: feature.featureId,
                    label: <Link to={config.routes[feature.keyRoute]} onClick={handleClickA}>{feature.featureName}</Link>,
                    icon: feature.icon ? <IconComponentFree /> : <MenuOutlined />,
                    orders: feature.orderNo,
                    children: [],
                });

            }
        }


        function sortAndCleanTree(node) {
            // Sắp xếp children của nút hiện tại
            if (node.children) {
                if (node.children.length > 0) {
                    node.children.sort((a, b) => a.orders - b.orders);

                    // Đệ quy để sắp xếp và làm sạch các nút con
                    node.children.forEach(child => sortAndCleanTree(child));
                }

                // Nếu sau khi đệ quy, children của node vẫn rỗng, xóa thuộc tính children
                if (node.children.length === 0) {
                    delete node.children;
                }
            }
        }

        // Sắp xếp tất cả các nút của cây
        treeData.forEach(node => sortAndCleanTree(node));
        // Sắp xếp các nút cấp cao nhất theo orderNo
        treeData.sort((a, b) => a.orders - b.orders);

        return treeData;
    };

    // Xử lý khi người dùng nhấn vào thẻ a trên menu
    const handleClickA = (e) => {
        const isValidRoute = Object.values(routes).includes(e.key);
        if (!isValidRoute) {
            e.preventDefault(); // Ngăn chặn hành động click nếu route không hợp lệ        
        } else {
            navigate(e.key);
        }
    };

    const fetchDataMenu = async () => {
        try {
            const response = await getWhere({ permission: permission });
            if (response.status === 200) {
                const tree = await buildTreeData(response.data.data);
                setMenu(tree);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Lấy dữ liệu menu
        if (permission) {
            fetchDataMenu();
        }
    }, [permission])


    return (
        <MenuContext.Provider value={{ menu, fetchDataMenu }}>
            {children}
        </MenuContext.Provider>
    );
};
