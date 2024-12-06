import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { message } from '../../../hooks/useAntdApp';
import Update from '../../Core/Update';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { getAll } from '../../../services/featureService';
import { createPermissionFeature, deletePermissionFeatures, getWhere, updatePermissionFeature } from '../../../services/permissionFeatureService';
import {
    getWhere as getWherePermissionFeature,
} from '../../../services/permissionFeatureService';
import styles from "./PhanQuyenUpdate.module.scss"
import classNames from 'classnames/bind';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { PermissionDetailContext } from '../../../context/PermissionDetailContext';
import { MenuContext } from '../../../context/MenuContext';

const cx = classNames.bind(styles)

const PhanQuyenUpdate = memo(function PhanQuyenUpdate({
    title,
    showModal,
    setShowModal,
}) {
    const [dataFeature, setDataFeature] = useState([]);
    const { permission } = useContext(AccountLoginContext);
    const { fetchDataMenu } = useContext(MenuContext);
    const [isLoading, setIsLoading] = useState(true);
    const { updatePermissionDetails } = useContext(PermissionDetailContext);



    useEffect(() => {
        const getFeature = async () => {
            setIsLoading(true);
            try {
                const response = await getAll()

                if (response.status === 200) {
                    const promise = response.data.data.map(async (feature) => {
                        const responseAuthorization = await getWhere({ permission: showModal.permissionId, feature: feature.featureId })

                        feature.permissionDetail =
                            (responseAuthorization.status === 200 && responseAuthorization.data.data !== null)
                                ? responseAuthorization.data.data[0].permissionDetail
                                : {
                                    isAdd: false,
                                    isView: false,
                                    isEdit: false,
                                    isDelete: false
                                };
                        feature.id = feature.featureId;
                        return feature;
                    })
                    const featureAuthorization = await Promise.all(promise);
                    // Nhóm tính năng theo cha, tạo một map với key là featureId của tính năng cha
                    const featureMap = new Map();
                    const rootFeatures = [];  // Danh sách tính năng gốc (không có cha)

                    featureAuthorization.forEach((feature) => {
                        if (feature.parent) {
                            // Nếu tính năng có cha, thêm vào danh sách con của cha
                            if (!featureMap.has(feature.parent.featureId)) {
                                featureMap.set(feature.parent.featureId, []);
                            }
                            featureMap.get(feature.parent.featureId).push(feature);
                        } else {
                            // Nếu không có cha, thêm vào danh sách tính năng gốc
                            rootFeatures.push(feature);
                        }
                    });

                    // Hàm đệ quy để gắn các tính năng con vào cha của chúng
                    const attachChildren = (features) => {
                        features.forEach((feature) => {
                            if (featureMap.has(feature.featureId)) {
                                feature.children = featureMap.get(feature.featureId).map((child) => ({
                                    ...child,
                                    key: `${feature.featureId}-${child.featureId}`, // Tạo key duy nhất
                                }));
                                attachChildren(feature.children);  // Đệ quy gắn con cho tất cả các cấp
                            }
                        });
                    };

                    // Gắn các tính năng con vào các tính năng gốc
                    attachChildren(rootFeatures);
                    setDataFeature(rootFeatures);  // Cập nhật dữ liệu tính năng có cấu trúc cha-con vào state
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }

        }

        if (showModal.permissionId) {
            getFeature();
        }
    }, [showModal]);

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handlePhanQuyen = async () => {
        // Lấy tất cả các hàng trong bảng
        const rows = document.querySelectorAll('.phanquyen-table .ant-table-row');

        const updatePromises = Array.from(rows).map(async (row) => {
            // Lấy các checkbox trong từng hàng
            const checkboxes = row.querySelectorAll('input.checkbox-permission-feature');
            const permissionDetail = {
                isView: false,
                isAdd: false,
                isEdit: false,
                isDelete: false,
            };

            let featureId = null;

            // Duyệt qua tất cả các checkbox trong hàng
            checkboxes.forEach((checkbox) => {
                // Tìm vị trí của dấu "_" cuối cùng
                const lastUnderscoreIndex = checkbox.value.lastIndexOf('_');

                // Cắt chuỗi để lấy featureId và permissionType
                featureId = checkbox.value.substring(0, lastUnderscoreIndex); // Giữ nguyên featureId cho tất cả các quyền trong cùng một hàng
                const permissionDetailKey = checkbox.value.substring(lastUnderscoreIndex + 1);

                // Cập nhật trạng thái quyền dựa trên checkbox (true/false)
                permissionDetail[permissionDetailKey] = checkbox.checked;
            });

            if (featureId) {
                const conditions = { permission: showModal.permissionId, feature: featureId };

                try {
                    const response = await getWherePermissionFeature(conditions);

                    if (response.status === 200 && response.data.data !== null) {
                        const existingData = response.data.data[0];
                        // Kiểm tra nếu tất cả các giá trị trong permissionDetail là false
                        const allFalse = Object.values(permissionDetail).every(value => value === false);

                        if (allFalse) {
                            // Nếu tất cả đều là false thì xóa quyền
                            await deletePermissionFeatures(existingData.id);
                        } else {
                            // Dữ liệu cần cập nhật
                            const data = {
                                permissionId: showModal.permissionId,
                                featureId: featureId,
                                permissionDetail: permissionDetail
                            };

                            // Gọi hàm cập nhật
                            await updatePermissionFeature(existingData.id, data);
                        }
                    }

                    if (response.status === 204) {
                        // Kiểm tra nếu ít nhất một giá trị trong permissionDetail là true
                        const hasPermission = Object.values(permissionDetail).some(value => value === true);
                        if (hasPermission) {
                            // Dữ liệu cần tạo
                            const data = {
                                permissionId: showModal.permissionId,
                                featureId: featureId,
                                permissionDetail: permissionDetail
                            };
                            await createPermissionFeature(data);
                        }
                    }
                } catch (error) {
                    console.error('Lưu phân quyền thất bại:', error);
                }
            }
        });

        // Đợi tất cả các promise hoàn thành
        await Promise.all(updatePromises);
        message.success('Lưu phân quyền thành công');

        // Load lại phân quyền
        await handleReLoadPerrmission();
        // Load lại menu
        fetchDataMenu();
    };

    const handleReLoadPerrmission = async () => {
        try {
            const response = await getWhere({ permission: permission });
            if (response.status === 200) {
                const features = response.data.data.map((item) => ({
                    feature: item.feature,
                    permissionDetail: item.permissionDetail,
                }));
                updatePermissionDetails(features);

            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateFeatureRecursively = useCallback((features, targetFeatureId, updateCallback) => {
        return features.map(feature => {
            if (feature.featureId === targetFeatureId) {
                // Nếu tìm thấy tính năng cần cập nhật
                return updateCallback(feature);
            }

            if (feature.children && feature.children.length > 0) {
                // Nếu có children, gọi đệ quy để cập nhật
                return {
                    ...feature,
                    children: updateFeatureRecursively(feature.children, targetFeatureId, updateCallback),
                };
            }

            return feature; // Trả lại tính năng không bị thay đổi
        });
    }, []);

    const handleChangeCheckbox = useCallback((event) => {
        // eslint-disable-next-line no-unused-vars
        const { name, value, checked } = event.target;
        // Tìm vị trí của dấu "_" cuối cùng
        const lastUnderscoreIndex = value.lastIndexOf('_');

        // Cắt chuỗi để lấy featureId và permissionType
        const featureId = value.substring(0, lastUnderscoreIndex);
        const permissionType = value.substring(lastUnderscoreIndex + 1);

        // Hàm callback để cập nhật trạng thái `permissionDetail`
        const updateCallback = (feature) => ({
            ...feature,
            permissionDetail: {
                ...feature.permissionDetail,
                [permissionType]: checked,
            },
        });

        // Cập nhật dữ liệu bằng hàm đệ quy cho cả cấp cha và con
        const updatedDataFeature = updateFeatureRecursively(dataFeature, featureId, updateCallback);

        // Cập nhật lại state
        setDataFeature(updatedDataFeature);
    }, [dataFeature, updateFeatureRecursively]);



    const handleSelectAll = useCallback((type) => {
        const allChecked = dataFeature.every(record => record.permissionDetail?.[type] ?? false);
        const newData = dataFeature.map(record => ({
            ...record,
            permissionDetail: {
                ...record.permissionDetail,
                [type]: !allChecked, // Đảo ngược trạng thái
            },
        }));
        setDataFeature(newData);
    }, [dataFeature]);


    const handleSelectRow = useCallback((record) => {
        const allChecked = Object.keys(record.permissionDetail).every(
            (key) => record.permissionDetail?.[key] ?? false
        );

        // Hàm callback để cập nhật trạng thái `permissionDetail`
        const updateCallback = (feature) => ({
            ...feature,
            permissionDetail: {
                ...feature.permissionDetail,
                isView: !allChecked,
                isAdd: !allChecked,
                isEdit: !allChecked,
                isDelete: !allChecked,
            },
        });

        // Cập nhật dữ liệu bằng hàm đệ quy
        const updatedDataFeature = updateFeatureRecursively(dataFeature, record.featureId, updateCallback);

        setDataFeature(updatedDataFeature);
    }, [dataFeature, updateFeatureRecursively]);


    const columns = useCallback(
        () => [
            {
                title: 'STT',
                dataIndex: 'index',
                key: 'stt',
                width: '120px',
                render: (_, record, index) => {
                    const permissionDetail = record.permissionDetail;
                    const allChecked = Object.keys(permissionDetail).length > 0
                        && Object.keys(permissionDetail).every((key) => permissionDetail[key]);

                    return (
                        <div className={cx('container-stt')}>
                            <input
                                type="checkbox"
                                onChange={() => handleSelectRow(record)}
                                checked={allChecked}
                            />
                            {index + 1}
                        </div>
                    );
                },
                align: 'center',
            },
            {
                title: 'Mã chức năng',
                dataIndex: 'featureId',
                key: 'featureId',
            },
            {
                title: 'Tên chức năng',
                dataIndex: 'featureName',
                key: 'featureName',
            },
            {
                title: 'Key Route',
                dataIndex: 'keyRoute',
                key: 'keyRoute',
            },
            {
                title: (
                    <div className={cx("title-column-table")} onClick={() => handleSelectAll('isView')}>
                        Xem
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('isView')}
                            checked={dataFeature.every(record => record.permissionDetail?.isView ?? false)}
                        />
                    </div>
                ),
                dataIndex: "isView",
                key: "isView",
                width: '100px',
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isView ?? false; // Sử dụng giá trị mặc định là false nếu không có dữ liệu
                    return record.keyRoute && (
                        <div
                            onClick={() => handleChangeCheckbox({
                                target: {
                                    value: record.featureId + "_isView",
                                    checked: !isChecked, name: record.featureId
                                }
                            })}
                        >
                            <input
                                type="checkbox"
                                value={record.featureId + "_isView"}
                                name={record.featureId}
                                className="checkbox-permission-feature"
                                checked={isChecked} // Luôn có giá trị boolean
                                onChange={handleChangeCheckbox}
                            />
                        </div >
                    );
                },
                align: 'center',
            },
            {
                title: (
                    <div className={cx("title-column-table")} onClick={() => handleSelectAll('isAdd')}>
                        Thêm
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('isAdd')}
                            checked={dataFeature.every(record => record.permissionDetail?.isAdd ?? false)}
                        />
                    </div>
                ),
                dataIndex: "isAdd",
                key: "isAdd",
                width: '100px',
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isAdd ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div
                            onClick={() => handleChangeCheckbox({
                                target: {
                                    value: record.featureId + "_isAdd",
                                    checked: !isChecked, name: record.featureId
                                }
                            })}
                        >
                            <input
                                type="checkbox"
                                value={record.featureId + "_isAdd"}
                                name={record.featureId}
                                className="checkbox-permission-feature"
                                checked={isChecked}
                                onChange={handleChangeCheckbox}
                            />
                        </div>
                    );
                },
                align: 'center',
            },
            {
                title: (
                    <div className={cx("title-column-table")} onClick={() => handleSelectAll('isEdit')}>
                        Sửa
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('isEdit')}
                            checked={dataFeature.every(record => record.permissionDetail?.isEdit ?? false)}
                        />
                    </div>
                ),
                dataIndex: "isEdit",
                key: "isEdit",
                width: '100px',
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isEdit ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div
                            onClick={() => handleChangeCheckbox({
                                target: {
                                    value: record.featureId + "_isEdit",
                                    checked: !isChecked, name: record.featureId
                                }
                            })}
                        >
                            <input
                                type="checkbox"
                                value={record.featureId + "_isEdit"}
                                name={record.featureId}
                                className="checkbox-permission-feature"
                                checked={isChecked}
                                onChange={handleChangeCheckbox}
                            />
                        </div>
                    );
                },
                align: 'center',
            },
            {
                title: (
                    <div className={cx("title-column-table")} onClick={() => handleSelectAll('isDelete')}>
                        Xóa
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('isDelete')}
                            checked={dataFeature.every(record => record.permissionDetail?.isDelete ?? false)}
                        />
                    </div>
                ),
                dataIndex: "isDelete",
                key: "isDelete",
                width: '100px',
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isDelete ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div
                            onClick={() => handleChangeCheckbox({
                                target: {
                                    value: record.featureId + "_isDelete",
                                    checked: !isChecked, name: record.featureId
                                }
                            })}
                        >
                            <input
                                type="checkbox"
                                value={record.featureId + "_isDelete"}
                                name={record.featureId}
                                className="checkbox-permission-feature"
                                checked={isChecked}
                                onChange={handleChangeCheckbox}
                            />
                        </div>
                    );
                },
                align: 'center',
            }

        ],
        [dataFeature, handleChangeCheckbox, handleSelectAll, handleSelectRow],
    );

    return (
        <Update
            fullTitle={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handlePhanQuyen}
            width='1200px'
        >
            <>
                <TableCustomAnt
                    className={cx('phanquyen-table')}
                    columns={columns(setShowModal)}
                    data={dataFeature}
                    height="400px"
                    isHaveRowSelection={false}
                    isPagination={false}
                    isHideSTT={true}
                    loading={isLoading}
                    keyIdChange={"featureId"}
                />
            </>
        </Update>
    );
});

export default PhanQuyenUpdate;

