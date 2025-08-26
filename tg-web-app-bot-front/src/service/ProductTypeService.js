// src/service/ProductTypeService.js
import $api from "../http/index";
import { API_ENDPOINTS } from "../http/apiEndpoints";

export default class ProductTypeService {
    static async fetchTypes(params = {}) {
        const response = await $api.get(API_ENDPOINTS.TYPE.GET, {
            params: params 
        });
        return response.data;
    }

    static async getTypeById(id) {
        const response = await $api.get(`${API_ENDPOINTS.TYPE.GET}/${id}`);
        return response.data;
    }

    static async createType(typeData) {
        const response = await $api.post(API_ENDPOINTS.TYPE.CREATE, {
            name: typeData.name
        });
        return response.data;
    }

    static async editType(id, typeData) {
        try {
            const response = await $api.put(API_ENDPOINTS.TYPE.EDIT(id), {
                name: typeData.name
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при редактировании типа продукта:', error);
            throw error;
        }
    }

    static async deleteType(id) {
        try {
            const response = await $api.delete(API_ENDPOINTS.TYPE.DELETE(id));
            return response.data;
        } catch (error) {
            console.error('Ошибка при удалении типа продукта:', error);
            throw error;
        }
    }
}