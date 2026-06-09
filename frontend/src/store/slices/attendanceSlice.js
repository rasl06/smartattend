import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceAPI } from '../../api/attendance';

export const fetchMyAttendance = createAsyncThunk('attendance/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.getMy();
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

export const scanAttendance = createAsyncThunk('attendance/scan', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.scan(payload);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || 'Scan failed'); }
});

export const fetchClassAttendance = createAsyncThunk('attendance/fetchClass', async (classId, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.getClassAttendance(classId);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error); }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    my: null, classLogs: [], loading: false, scanResult: null, error: null,
  },
  reducers: {
    clearScanResult: (s) => { s.scanResult = null; s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchMyAttendance.pending,   (s) => { s.loading = true; })
      .addCase(fetchMyAttendance.fulfilled, (s, a) => { s.loading = false; s.my = a.payload; })
      .addCase(fetchMyAttendance.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(scanAttendance.pending,      (s) => { s.loading = true; s.scanResult = null; s.error = null; })
      .addCase(scanAttendance.fulfilled,    (s, a) => { s.loading = false; s.scanResult = a.payload; })
      .addCase(scanAttendance.rejected,     (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchClassAttendance.fulfilled, (s, a) => { s.classLogs = a.payload; });
  },
});

export const { clearScanResult } = attendanceSlice.actions;
export default attendanceSlice.reducer;
