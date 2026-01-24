import React from 'react';

// Basic mock for DateTimePicker on the web
// Utilizing standard HTML input types for date/time where possible
const DateTimePicker = (props: any) => {
    const { value, mode, onChange, style } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            const date = new Date(e.target.value);
            // Construct event similar to Native synthetic event if needed, 
            // but usually the second arg (date) is what's used.
            onChange({ type: 'set', nativeEvent: {} }, date);
        }
    };

    // Format date for input value (YYYY-MM-DD or HH:mm)
    const getStringValue = () => {
        if (!value) return '';
        const date = new Date(value);
        if (mode === 'time') {
            return date.toTimeString().slice(0, 5);
        }
        return date.toISOString().split('T')[0];
    };

    const inputType = mode === 'time' ? 'time' : 'date';

    return (
        <input
            type={inputType}
            value={getStringValue()}
            onChange={handleChange}
            style={{
                padding: 10,
                borderRadius: 5,
                border: '1px solid #ccc',
                marginTop: 10,
                ...style // Pass through style props
            }}
        />
    );
};

export default DateTimePicker;
