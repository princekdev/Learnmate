import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('learnmate_token');
    const savedUser = localStorage.getItem('learnmate_user');
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        // Re-validate token with server
        authAPI.me()
          .then((res) => {
            dispatch({ type: 'UPDATE_USER', payload: res.data.user });
            localStorage.setItem('learnmate_user', JSON.stringify(res.data.user));
          })
          .catch(() => {
            dispatch({ type: 'LOGOUT' });
            localStorage.removeItem('learnmate_token');
            localStorage.removeItem('learnmate_user');
          });
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('learnmate_token', token);
    localStorage.setItem('learnmate_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('learnmate_token', token);
    localStorage.setItem('learnmate_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return user;
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('learnmate_token');
    localStorage.removeItem('learnmate_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updated = { ...state.user, ...userData };
    localStorage.setItem('learnmate_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: updated });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
