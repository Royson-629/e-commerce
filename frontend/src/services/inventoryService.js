import api from './api';

/**
 * Configurable Endpoint Paths for Spring Boot InventoryController.
 * Adjust these constants to match your backend @RequestMapping paths.
 */
export const INVENTORY_ENDPOINTS = {
  BASE: '/inventory',
  STOCK_UPDATE: (productId) => `/inventory/${productId}/stock`,
  LOW_STOCK: '/inventory/low-stock',
  SUMMARY: '/inventory/summary'
};

export const inventoryService = {
  /**
   * Fetch all inventory items
   * GET /api/inventory
   */
  async getInventory(params = {}) {
    const response = await api.get(INVENTORY_ENDPOINTS.BASE, { params });
    return response.data;
  },

  /**
   * Fetch inventory summary metrics (total units, low stock count, out of stock)
   * GET /api/inventory/summary
   */
  async getInventorySummary() {
    const response = await api.get(INVENTORY_ENDPOINTS.SUMMARY);
    return response.data;
  },

  /**
   * Update product stock quantity on backend
   * PATCH /api/inventory/{productId}/stock
   * payload: { stock, reason, mode }
   */
  async updateStock(productId, stockPayload) {
    const response = await api.patch(INVENTORY_ENDPOINTS.STOCK_UPDATE(productId), stockPayload);
    return response.data;
  },

  /**
   * Fetch low stock alert products
   * GET /api/inventory/low-stock
   */
  async getLowStockAlerts() {
    const response = await api.get(INVENTORY_ENDPOINTS.LOW_STOCK);
    return response.data;
  }
};

export default inventoryService;
