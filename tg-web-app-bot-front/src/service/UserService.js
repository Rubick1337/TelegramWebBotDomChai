import $api from "../http/index";
import { API_ENDPOINTS } from "../http/apiEndpoints";

export default class UserService {
    static async login(loginData) {
        const response = await $api.post(API_ENDPOINTS.USER.LOGIN, {
            username: loginData.username,
            password: loginData.password
        });
        return response.data;
    }

    static async register(registerData) {
        const response = await $api.post(API_ENDPOINTS.USER.REGISTER, {
            username: registerData.username,
            password: registerData.password,
            email: registerData.email,
            adress: registerData.adress,
            role: registerData.role || 'user'
        });
        return response.data;
    }

    static async fetchUsers(params = {}) {
        const response = await $api.get(API_ENDPOINTS.USER.GET_ALL, {
            params: {
                page: params.page,
                limit: params.limit,
                search: params.search
            }
        });
        return response.data;
    }

    static async updateUserRole(id, roleData) {
        const response = await $api.put(API_ENDPOINTS.USER.UPDATE_ROLE(id), {
            role: roleData.role
        });
        return response.data;
    }
}