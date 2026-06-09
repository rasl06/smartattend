import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';

const TOKEN_KEY = 'sa_token';

export const loginThunk = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    localStorage.setItem(TOKEN_KEY, data.data.accessToken);
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Login failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.me();
    return data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.error || 'Failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try { await authAPI.logout(); } catch {}
  localStorage.removeItem(TOKEN_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    null,
    token:   localStorage.getItem(TOKEN_KEY) || null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(loginThunk.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(loginThunk.fulfilled,(s, a) => {
        s.loading = false;
        s.token   = a.payload.accessToken;
        s.user    = a.payload.user;
      })
      .addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMe.fulfilled,   (s, a) => { s.user = a.payload; s.loading = false; })
      .addCase(fetchMe.pending,     (s)    => { s.loading = true; })
      .addCase(fetchMe.rejected,    (s)    => { s.loading = false; s.token = null; localStorage.removeItem('sa_token'); })
      .addCase(logoutThunk.fulfilled,(s)   => { s.user = null; s.token = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
