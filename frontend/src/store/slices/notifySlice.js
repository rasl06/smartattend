import { createSlice } from '@reduxjs/toolkit';

let nextId = 0;

const notifySlice = createSlice({
  name: 'notify',
  initialState: { toasts: [] },
  reducers: {
    addToast: (s, a) => {
      s.toasts.push({ id: ++nextId, type: 'info', ...a.payload });
    },
    removeToast: (s, a) => {
      s.toasts = s.toasts.filter((t) => t.id !== a.payload);
    },
  },
});

export const { addToast, removeToast } = notifySlice.actions;

/** Показывает уведомление на 4 секунды */
export const notify = (message, type = 'info') => (dispatch) => {
  const id = ++nextId;
  dispatch(addToast({ id, message, type }));
  setTimeout(() => dispatch(removeToast(id)), 4000);
};

export default notifySlice.reducer;
