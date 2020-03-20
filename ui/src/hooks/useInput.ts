import React from 'react'

export default function useInput (initialValue = '') {
    const [value, setValue] = React.useState('')
    const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value
        setValue(text)
    }

    const onKeyDownValue = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case 'Escape': {
                setValue('')
                break;
            }
        }
    }

    return [
        value,
        setValue,
        onChangeValue,
        onKeyDownValue,
    ] as [
        string,
        React.Dispatch<React.SetStateAction<string>>,
        (event: React.ChangeEvent<HTMLInputElement>) => void,
        (event: React.KeyboardEvent<HTMLInputElement>) => void
    ]
}