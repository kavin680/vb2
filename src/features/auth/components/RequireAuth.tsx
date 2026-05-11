import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store/store';
import { ROUTES } from '../../../shared/constants/routes';

export const RequireAuth = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
};
