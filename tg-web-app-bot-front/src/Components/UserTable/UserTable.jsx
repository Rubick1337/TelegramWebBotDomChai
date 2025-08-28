// components/UserTable/UserTable.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl
} from '@mui/material';
import { fetchUsers, updateUserRole } from '../../store/slice/userSlice';

const UserTable = () => {
    const dispatch = useDispatch();
    const { users, loading, error, updateLoading } = useSelector(state => state.user);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [localUsers, setLocalUsers] = useState([]);

    useEffect(() => {
        const params = {
            page: page + 1,
            limit: rowsPerPage,
            search: searchTerm
        };
        dispatch(fetchUsers(params));
    }, [dispatch, page, rowsPerPage, searchTerm]);

    useEffect(() => {
        if (users.rows) {
            setLocalUsers(users.rows);
        }
    }, [users]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchInputChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearchSubmit = () => {
        setSearchTerm(searchValue);
        setPage(0);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleBlur = () => {
        handleSearchSubmit();
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await dispatch(updateUserRole({
                id: userId,
                roleData: { role: newRole }
            })).unwrap();

            setLocalUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error('Ошибка при изменении роли:', error);
        }
    };

    if (loading && page === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box p={2}>
                <Typography variant="h5" gutterBottom>
                    Управление пользователями
                </Typography>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по username или email"
                    value={searchValue}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    sx={{ mb: 2 }}
                    InputProps={{
                        endAdornment: searchTerm && (
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                onClick={() => {
                                    setSearchValue('');
                                    setSearchTerm('');
                                    setPage(0);
                                }}
                            >
                                Очистить
                            </Typography>
                        )
                    }}
                />

                {searchTerm && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Поиск: "{searchTerm}"
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            {/* Обертка с гарантированной прокруткой для Telegram */}
            <Box sx={{
                width: '100%',
                overflowX: 'scroll', // Более надежно чем 'auto'
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: '-ms-autohiding-scrollbar',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                    height: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                    borderRadius: '3px'
                }
            }}>
                <Box sx={{
                    minWidth: '800px', // Фиксированная минимальная ширина
                    width: '100%'
                }}>
                    <TableContainer sx={{
                        maxHeight: 440,
                        '& .MuiTableCell-root': {
                            whiteSpace: 'nowrap',
                            px: 1,
                            py: 1,
                            fontSize: '0.875rem' // Уменьшаем размер шрифта
                        }
                    }}>
                        <Table stickyHeader aria-label="user table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: '60px', fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ minWidth: '120px', fontWeight: 'bold' }}>Username</TableCell>
                                    <TableCell sx={{ minWidth: '180px', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ minWidth: '200px', fontWeight: 'bold' }}>Адрес</TableCell>
                                    <TableCell sx={{ minWidth: '120px', fontWeight: 'bold' }}>Роль</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {localUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {loading ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    {searchTerm
                                                        ? `Пользователи по запросу "${searchTerm}" не найдены`
                                                        : 'Пользователи не найдены'
                                                    }
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    localUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {user.adress || 'Не указан'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        disabled={updateLoading}
                                                        size="small"
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        <MenuItem value="user" sx={{ fontSize: '0.875rem' }}>User</MenuItem>
                                                        <MenuItem value="admin" sx={{ fontSize: '0.875rem' }}>Admin</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                {updateLoading && (
                                                    <CircularProgress size={16} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            <TablePagination
                rowsPerPageOptions={[5, 8, 10, 25]}
                component="div"
                count={users.count || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
                }
                sx={{
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: '0.875rem'
                    }
                }}
            />
        </Paper>
    );
};

export default UserTable;