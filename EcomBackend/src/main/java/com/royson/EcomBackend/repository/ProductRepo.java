
package com.royson.EcomBackend.repository;

import com.royson.EcomBackend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepo extends JpaRepository<ProductEntity, Long> {

    long countByCategory_Id(Long categoryId);

    // Search product name, SKU or brand
    List<ProductEntity> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBrandContainingIgnoreCase(
            String name,
            String sku,
            String brand
    );

    // Filter by category
    List<ProductEntity> findByCategory_Id(Long categoryId);

    // Filter by status
    List<ProductEntity> findByStatusIgnoreCase(String status);

}
