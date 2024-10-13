import React, { createContext, useState } from 'react';

export const PermissionDetailContext = createContext();

export const PermissionDetailProvider = ({ children }) => {
    const [permissionDetails, setPermissionDetails] = useState({});

    // Hàm cập nhật quyền cho từng feature theo keyRoute
    const updatePermissionDetails = (features) => {
        const newPermissionDetails = {};
        features.forEach(({ feature, permissionDetail }) => {
            newPermissionDetails[feature.keyRoute] = permissionDetail;
        });
        setPermissionDetails(newPermissionDetails);
    };

    return (
        <PermissionDetailContext.Provider value={{ permissionDetails, updatePermissionDetails }}>
            {children}
        </PermissionDetailContext.Provider>
    );
};
