import api from './api';

/**
 * Configurable Endpoint Paths for Spring Boot CategoryController.
 * Adjust these constants to match your backend @RequestMapping paths.
 */
export const CATEGORY_ENDPOINTS = {
  BASE: '/categories',
  BY_ID: (id) => `/categories/${id}`
};

export const categoryService = {
  /**
   * Fetch all categories
   * GET /api/categories
   */
  async getAllCategories() {
    const response = await api.get(CATEGORY_ENDPOINTS.BASE);
    return response.data;
  },

  /**
   * Fetch category by ID
   * GET /api/categories/{id}
   */
  async getCategoryById(id) {
    const response = await api.get(CATEGORY_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  /**
   * Create a new category
   * POST /api/categories
   */
  async createCategory(categoryData) {
    const response = await api.post(CATEGORY_ENDPOINTS.BASE, categoryData);
    return response.data;
  },

  /**
   * Update category
   * PUT /api/categories/{id}
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(CATEGORY_ENDPOINTS.BY_ID(id), categoryData);
    return response.data;
  },

  /**
   * Delete category
   * DELETE /api/categories/{id}
   */
  async deleteCategory(id) {
    const response = await api.delete(CATEGORY_ENDPOINTS.BY_ID(id));
    return response.data;
  }
};

export default categoryService;
