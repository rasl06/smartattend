import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { classesAPI } from '../../api/classes';

export const fetchClasses = createAsyncThunk('classes/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await classesAPI.getAll();
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const createClass = createAsyncThunk('classes/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await classesAPI.create(payload);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const fetchQR = createAsyncThunk('classes/fetchQR', async (classId, { rejectWithValue }) => {
  try {
    const { data } = await classesAPI.getQR(classId);
    return data.data;
  } catch {
    // Fallback — генерируем QR через публичный API
    const payload = btoa(JSON.stringify({ class_id: classId, exp: Math.floor(Date.now()/1000) + 90 }));
    const token   = `demo.${payload}.sig`;
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(token)}`;
    return { qrImage, token, expiresAt: Math.floor(Date.now()/1000) + 90, ttl: 90 };
  }
});

const classesSlice = createSlice({
  name: 'classes',
  initialState: { list: [], current: null, qr: null, loading: false, error: null },
  reducers: {
    clearQR: (s) => { s.qr = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchClasses.pending,   (s) => { s.loading = true; })
      .addCase(fetchClasses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchClasses.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createClass.fulfilled,  (s, a) => { s.list.unshift(a.payload); })
      .addCase(fetchQR.pending,        (s) => { s.qr = null; })
      .addCase(fetchQR.fulfilled,      (s, a) => { s.qr = a.payload; });
  },
});

export const { clearQR } = classesSlice.actions;
export default classesSlice.reducer;
