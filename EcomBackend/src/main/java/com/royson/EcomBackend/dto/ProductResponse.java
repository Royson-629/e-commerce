package com.royson.EcomBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String brand;
    private String description;
    private BigDecimal sellingPrice;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private String imageUrl;
    private String status;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
