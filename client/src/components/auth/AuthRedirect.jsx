import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { openAuthDrawer, switchAuthView } from '../../features/auth/authSlice';

const AuthRedirect = ({ view }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // Open drawer with the specified view
        dispatch(switchAuthView(view));
        dispatch(openAuthDrawer());

        // Navigate to home (drawer stays open)
        navigate('/', { replace: true });
    }, [dispatch, navigate, view]);

    return null;
};

export default AuthRedirect;
