import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice';
import { useGetMeQuery } from '../features/auth/authApi';

export const useAuth = () => {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { isLoading } = useGetMeQuery();
    const isVerified = user?.isVerified;

    return {
        isAuthenticated,
        isVerified,
        isLoading,
        user
    };
};