import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../../service/UserService';

// Асинхронные действия
export const loginUser = createAsyncThunk(
    'user/login',
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await UserService.login(loginData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/register',
    async (registerData, { rejectWithValue }) => {
        try {
            const response = await UserService.register(registerData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await UserService.fetchUsers(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'user/updateRole',
    async ({ id, roleData }, { rejectWithValue }) => {
        try {
            const response = await UserService.updateUserRole(id, roleData);
            return { id, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    currentUser: JSON.parse(localStorage.getItem('user')) || null,
    users: {
        rows: [],
        count: 0
    },
    loading: false,
    error: null,
    success: false,
    loginLoading: false,
    registerLoading: false,
    updateLoading: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Логин
            .addCase(loginUser.pending, (state) => {
                state.loginLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loginLoading = false;
                state.currentUser = action.payload.user;
                state.success = true;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loginLoading = false;
                state.error = action.payload;
            })

            // Регистрация
            .addCase(registerUser.pending, (state) => {
                state.registerLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.registerLoading = false;
                state.success = true;
                state.currentUser = action.payload.user;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registerLoading = false;
                state.error = action.payload;
            })

            // Получение списка пользователей
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Обновление роли пользователя
            .addCase(updateUserRole.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.success = true;

                // Обновляем пользователя в списке
                const index = state.users.rows.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users.rows[index].role = action.payload.role;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    logout,
    clearError,
    clearSuccess,
    setCurrentUser
} = userSlice.actions;

export default userSlice.reducer;