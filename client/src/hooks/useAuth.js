import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice';

export const useAuth = () => {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isVerified = user?.isVerified;

    return {
        isAuthenticated,
        isVerified,
        user
    };
};