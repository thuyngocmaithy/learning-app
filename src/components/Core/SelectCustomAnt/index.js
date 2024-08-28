import React, { useState } from 'react';
import { Select } from 'antd';

const SelectCustomAnt = ({ defaultValue, onChange, options, disabled }) => {
    const [selectedIcon, setSelectedIcon] = useState(defaultValue || '');

    const handleChange = (value) => {
        setSelectedIcon(value);
        onChange(value);
    };

    return (
        <Select
            disabled={disabled}
            value={selectedIcon}
            onChange={handleChange}
            style={{ width: '100%' }}
            options={options}
        ></Select>
    );
};

export default SelectCustomAnt;
