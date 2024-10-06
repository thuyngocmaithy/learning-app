import React, { memo, useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import Update from '../../Core/Update';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { getAll } from '../../../services/featureService';
import { createPermissionFeature, deletePermissionFeatures, getWhere, updatePermissionFeature } from '../../../services/permissionFeatureService';
import {
    getWhere as getWherePermissionFeature,
} from '../../../services/permissionFeatureService';


const PhanQuyenUpdate = memo(function PhanQuyenUpdate({
    title,
    showModal,
    setShowModal,
}) {

    const [dataFeature, setDataFeature] = useState([]);

    const getFeature = async () => {
        try {
            const response = await getAll()

            if (response.status === 200) {
                const promise = response.data.data.map(async (feature) => {
                    const responseAuthorization = await getWhere({ permission: showModal.permissionId, feature: feature.featureId })

                    feature.permissionDetail = responseAuthorization.status === 200
                        ? responseAuthorization.data.data[0].permissionDetail
                        : null;
                    return feature;
                })
                const featureAuthorization = await Promise.all(promise);
                setDataFeature(featureAuthorization)
            }
        } catch (error) {
            console.error(error);
        } finally {
            // setIsLoadingFeature(false);
        }

    }

    useEffect(() => {
        if (showModal) {
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
        const rows = document.querySelectorAll('.ant-table-row');

        const updatePromises = Array.from(rows).map(async (row) => {
            // Lấy các checkbox trong từng hàng
            const checkboxes = row.querySelectorAll('.checkbox-permission-feature');
            const permissionDetail = {
                isView: false,
                isAdd: false,
                isEdit: false,
                isDelete: false,
            };

            let featureId = null;

            // Duyệt qua tất cả các checkbox trong hàng
            checkboxes.forEach((checkbox) => {
                const value = checkbox.value.split('_');
                featureId = value[0]; // Giữ nguyên featureId cho tất cả các quyền trong cùng một hàng
                const permissionDetailKey = value[1]; // Lấy loại quyền từ giá trị của checkbox

                // Cập nhật trạng thái quyền dựa trên checkbox (true/false)
                permissionDetail[permissionDetailKey] = checkbox.checked;
            });

            if (featureId) {
                const conditions = { permission: showModal.permissionId, feature: featureId };

                try {
                    const response = await getWherePermissionFeature(conditions);

                    if (response.status === 200) {
                        const existingData = response.data.data[0];
                        // Kiểm tra nếu tất cả các giá trị trong permissionDetail là false
                        const allFalse = Object.values(permissionDetail).every(value => value === false);

                        if (allFalse) {
                            // Nếu tất cả đều là false thì xóa quyền
                            await deletePermissionFeatures(existingData.id);
                        } else {
                            console.log(permissionDetail);

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
                        console.log(permissionDetail);
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
    };

    const handleChangeCheckbox = (event) => {
        const { name, value, checked } = event.target;
        const [featureId, permissionType] = value.split("_"); // Lấy featureId và loại permission (isView, isAdd, isEdit, isDelete)

        // Cập nhật dataFeature
        const updatedDataFeature = dataFeature.map((feature) => {
            if (feature.featureId === featureId) {
                return {
                    ...feature,
                    permissionDetail: {
                        ...feature.permissionDetail,
                        [permissionType]: checked, // Cập nhật trạng thái checked cho loại permission tương ứng
                    },
                };
            }
            return feature;
        });

        // Cập nhật lại state
        setDataFeature(updatedDataFeature);
    };





    const columns = useCallback(
        () => [
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
                title: "Xem",
                dataIndex: "isView",
                key: "isView",
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isView ?? false; // Sử dụng giá trị mặc định là false nếu không có dữ liệu
                    return record.keyRoute && (
                        <div onClick={() => handleChangeCheckbox({ target: { value: record.featureId + "_isView", checked: !isChecked, name: record.featureId } })}>
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
                title: "Thêm",
                dataIndex: "isAdd",
                key: "isAdd",
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isAdd ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div onClick={() => handleChangeCheckbox({ target: { value: record.featureId + "_isAdd", checked: !isChecked, name: record.featureId } })}>
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
                title: "Sửa",
                dataIndex: "isEdit",
                key: "isEdit",
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isEdit ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div onClick={() => handleChangeCheckbox({ target: { value: record.featureId + "_isEdit", checked: !isChecked, name: record.featureId } })}>
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
                title: "Xóa",
                dataIndex: "isDelete",
                key: "isDelete",
                render: (_, record) => {
                    const isChecked = record.permissionDetail?.isDelete ?? false; // Giá trị mặc định
                    return record.keyRoute && (
                        <div onClick={() => handleChangeCheckbox({ target: { value: record.featureId + "_isDelete", checked: !isChecked, name: record.featureId } })}>
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
        [dataFeature],
    );

    return (
        <Update
            fullTitle={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handlePhanQuyen}
            width='1200px'
        >


            <TableCustomAnt
                columns={columns(setShowModal)}
                data={dataFeature}
                height="400px"
                isHaveRowSelection={false}
                isPagination={false}
            />



        </Update>
    );
});

export default PhanQuyenUpdate;

