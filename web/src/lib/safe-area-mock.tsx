import React, { createContext, useContext } from 'react';

const InsetsContext = createContext({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
});

export const SafeAreaProvider = ({ children, style }: any) => {
    return (
        <InsetsContext.Provider value={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <div style={style}>{children}</div>
        </InsetsContext.Provider>
    );
};

export const SafeAreaView = ({ children, style, ...props }: any) => {
    return <div style={style} {...props}>{children}</div>;
};

export const useSafeAreaInsets = () => {
    return useContext(InsetsContext);
};

export const useSafeAreaFrame = () => {
    return { x: 0, y: 0, width: 0, height: 0 };
};

export const withSafeAreaInsets = (Component: any) => (props: any) => (
    <Component {...props} insets={{ top: 0, right: 0, bottom: 0, left: 0 }} />
);

export default {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets,
    useSafeAreaFrame,
    withSafeAreaInsets,
};
