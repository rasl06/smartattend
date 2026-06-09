import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import notifyReducer     from './slices/notifySlice';
import classesReducer    from './slices/classesSlice';
import attendanceReducer from './slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    notify:     notifyReducer,
    classes:    classesReducer,
    attendance: attendanceReducer,
  },
});
