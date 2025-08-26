// src/service/ProductService.js
import $api from "../http/index";
import { API_ENDPOINTS } from "../http/apiEndpoints";

export default class ProductService {
    static async fetchProducts({ productTypeId, limit, page, search, sortOrder }) {
        const response = await $api.get(API_ENDPOINTS.PRODUCT.GET, {
            params: {
                productTypeId,
                limit: limit || 8,
                page: page || 1,
                search,
                sortOrder: sortOrder
            }

        });
        return response.data;
    }

    static async getProductById(id) {
        const response = await $api.get(`${API_ENDPOINTS.PRODUCT.GET}/${id}`);
        return response.data;
    }

    static async createProduct(formData) {
        const response = await $api.post(API_ENDPOINTS.PRODUCT.CREATE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }

    static async editProduct(id, formData) {
        try {
            const response = await $api.put(API_ENDPOINTS.PRODUCT.EDIT(id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка при редактировании продукта:', error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        const response = await $api.delete(API_ENDPOINTS.PRODUCT.DELETE(id));
        return response.data;
    }
}