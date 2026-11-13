
import api from './api';

/**
 * Configurable Endpoint Paths for Spring Boot ProductController.
 */
export const PRODUCT_ENDPOINTS = {
  BASE: '/products',
  BY_ID: (id) => `/products/${id}`,
  SEARCH: '/products/search',
  IMAGE_UPLOAD: '/products/images/upload'
};

export const productService = {
  /**
   * Fetch all products
   * GET /api/products
   */
  async getAllProducts(params = {}) {
    const response = await api.get(PRODUCT_ENDPOINTS.BASE, {
      params
    });

    return response.data;
  },

  /**
   * Fetch a single product by ID
   * GET /api/products/{id}
   */
  async getProductById(id) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error(
        `Invalid product ID: ${id}. Cannot fetch product details.`
      );
    }

    const response = await api.get(PRODUCT_ENDPOINTS.BY_ID(id));

    return response.data;
  },

  /**
   * Create a new product
   * POST /api/products
   */
  async createProduct(productData) {
    const response = await api.post(
      PRODUCT_ENDPOINTS.BASE,
      productData
    );

    return response.data;
  },

  /**
   * Update an existing product
   * PUT /api/products/{id}
   */
  async updateProduct(id, productData) {
    const response = await api.put(
      PRODUCT_ENDPOINTS.BY_ID(id),
      productData
    );

    return response.data;
  },

  /**
   * Delete a product by ID
   * DELETE /api/products/{id}
   */
  async deleteProduct(id) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error(`Invalid product ID: ${id}`);
    }

    const response = await api.delete(
      PRODUCT_ENDPOINTS.BY_ID(id)
    );

    return response.data;
  },

  /**
   * Search products by keyword
   * GET /api/products/search?query=...
   */
  async searchProducts(query, params = {}) {
    const response = await api.get(
      PRODUCT_ENDPOINTS.SEARCH,
      {
        params: { query, ...params }
      }
    );

    return response.data;
  },

  /**
   * Upload product image
   * POST /api/products/images/upload
   */
  async uploadProductImage(file) {
    const formData = new FormData();

    formData.append('file', file);

    const response = await api.post(
      PRODUCT_ENDPOINTS.IMAGE_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  }
};

export default productService;
