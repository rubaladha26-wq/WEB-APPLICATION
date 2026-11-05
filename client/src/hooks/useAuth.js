import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || 'Guest';

  const isAdmin = role === 'Admin';
  const isAccountant = role === 'Accountant' || isAdmin;
  const isStaff = role === 'Staff' || isAccountant || isAdmin;

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    role,
    isAdmin,
    isAccountant,
    isStaff,
    logout: handleLogout,
  };
};

