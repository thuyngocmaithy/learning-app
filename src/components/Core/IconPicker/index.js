import React, { useEffect, useState } from 'react';
import { Select, Tooltip } from 'antd';
import listIcon from '../../../assets/icons/listIconAnt';

const { Option } = Select;

const IconPicker = ({ defaultIcon, onChange }) => {
    const [selectedIcon, setSelectedIcon] = useState(defaultIcon || '');


    useEffect(() => {
        if (defaultIcon && listIcon[defaultIcon]) {
            setSelectedIcon(defaultIcon);
        }
    }, [defaultIcon]);

    const handleChange = (value) => {
        setSelectedIcon(value);
        onChange(value);
    };

    return (
        <Select
            showSearch
            placeholder="Chọn icon"
            value={selectedIcon || undefined}
            onChange={handleChange}
            style={{ width: '100%' }}
        >
            {Object.keys(listIcon).map((iconName) => {
                const IconComponent = listIcon[iconName];

                return (
                    <Option key={iconName} value={iconName}>
                        <Tooltip title={iconName}>
                            <IconComponent style={{ fontSize: 24, justifyContent: 'center' }} />
                            <span style={{ marginLeft: 8 }}>{iconName}</span>
                        </Tooltip>
                    </Option>
                );
            })}
        </Select>
    );
};

export default IconPicker;
