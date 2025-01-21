import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const UserAuth = ({children}) => {
    const {isAuthenticated} = useSelector(state => state.user)
    useEffect(() => {
        console.log(isAuthenticated)
    },[])
    if(!isAuthenticated){
        return (<Navigate to={'/login'} />)
    }
    else {
        return (<>{children}</>)
    }
}

export const UserRequireAuth = ({children}) => {
    const {isAuthenticated} = useSelector(state => state.user);
    if(isAuthenticated){
        return (<Navigate to={'/'} />);
    }
    else {
        return(<>
        {children}
        </>)
    };
}