import { useState } from 'react';

function useRel(initialState) {
    const [formState, setFormState] = useState(initialState);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return [formState, handleInputChange];
}

export default useRel;
