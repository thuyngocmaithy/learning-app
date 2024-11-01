import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { message } from 'antd';
import Update from '../../Core/Update';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { getAll } from '../../../services/featureService';
import { createPermissionFeature, deletePermissionFeatures, getWhere, updatePermissionFeature } from '../../../services/permissionFeatureService';
import {
    getWhere as getWherePermissionFeature,
} from '../../../services/permissionFeatureService';
import styles from "./DungKhungCTDTUpdate.module.scss"
import classNames from 'classnames/bind';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { PermissionDetailContext } from '../../../context/PermissionDetailContext';
import { MenuContext } from '../../../context/MenuContext';
import TreeFrame from '../../TreeFrame';

const cx = classNames.bind(styles)

const DungKhungCTDTUpdate = memo(function DungKhungCTDTUpdate({
    title,
    showModal,
    setShowModal,
}) {
    const [dataFeature, setDataFeature] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState([]);
    const [showModalDetail, setShowModalDetail] = useState(false);







    // useEffect(() => {
    //     if (showModal) {
    //         getFeature();
    //     }
    // }, [showModal]);

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    return (
        <Update
            fullTitle={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            // onUpdate={handleDungKhungCTDT}
            width='1200px'
        >
            <TreeFrame
                treeData={treeData}
                setTreeData={setTreeData}
                setSelectedFeature={setSelectedFeature}
                // reLoad={reLoadStructureFeature}
                setShowModalDetail={setShowModalDetail}
            />
        </Update>
    );
});

export default DungKhungCTDTUpdate;

