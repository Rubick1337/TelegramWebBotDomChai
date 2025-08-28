const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const API_ENDPOINTS = {
    PRODUCT: {
        GET: `${API_BASE_URL}api/product`,
        DELETE: (id) => `${API_BASE_URL}api/product/${id}`,
        CREATE: `${API_BASE_URL}api/product`,
        EDIT: (id) => `${API_BASE_URL}api/product/${id}`,
    },
    TYPE: {
        GET: `${API_BASE_URL}api/product/type`,
        DELETE: (id) => `${API_BASE_URL}api/product/type/${id}`,
        CREATE: `${API_BASE_URL}api/product/type`,
        EDIT: (id) => `${API_BASE_URL}api/product/type/${id}`,
    },
    ORDER: {
        GET: `${API_BASE_URL}api/order`,
        GET_ONE: (id) => `${API_BASE_URL}api/order/${id}`,
        CREATE: `${API_BASE_URL}api/order`,
        UPDATE_STATUS: (id) => `${API_BASE_URL}api/order/${id}/status`,
    },
    USER: {
        LOGIN: `${API_BASE_URL}api/user/login`,
        REGISTER: `${API_BASE_URL}api/user/register`,
        GET_ALL: `${API_BASE_URL}api/user/getAll`,
        UPDATE_ROLE: (id) => `${API_BASE_URL}api/user/${id}`,
    }
}