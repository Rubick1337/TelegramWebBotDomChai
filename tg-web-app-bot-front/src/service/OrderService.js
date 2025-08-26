// src/service/OrderService.js
import $api from "../http/index";
import { API_ENDPOINTS } from "../http/apiEndpoints";

export default class OrderService {
    static async fetchOrders(params = {}) {
        const response = await $api.get(API_ENDPOINTS.ORDER.GET, { params });
        return response.data;
    }

    static async getOrderById(id) {
        const response = await $api.get(API_ENDPOINTS.ORDER.GET_ONE(id));
        return response.data;
    }

    static async createOrder(orderData) {
        const response = await $api.post(API_ENDPOINTS.ORDER.CREATE, orderData);
        return response.data;
    }

    static async updateOrderStatus(id, status) {
        const response = await $api.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(id), { status });
        return response.data;
    }

    static async createOrderFromCart(cartItems, totalAmount, shippingAddress, userId = null) {
        const items = cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price
        }));

        const orderData = {
            items,
            totalAmount,
            shippingAddress,
            userId
        };

        return await this.createOrder(orderData);
    }
}