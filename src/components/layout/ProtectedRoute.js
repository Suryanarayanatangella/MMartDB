import useSelector from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsLoggedIn } from '../../store/authSlice';
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const location = useLocation(); 
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};
export default ProtectedRoute;