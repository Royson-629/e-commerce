package com.royson.EcomBackend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

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
}
