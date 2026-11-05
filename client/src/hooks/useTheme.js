import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../redux/slices/uiSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (mode) => dispatch(setTheme(mode)),
  };
};

