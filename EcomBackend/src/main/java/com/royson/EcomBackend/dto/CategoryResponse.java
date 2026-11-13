package com.royson.EcomBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private Long linkedProducts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
