package com.royson.EcomBackend.service;

import com.royson.EcomBackend.dto.ProductRequest;
import com.royson.EcomBackend.dto.ProductResponse;
import com.royson.EcomBackend.entity.CategoryEntity;
import com.royson.EcomBackend.entity.ProductEntity;
import com.royson.EcomBackend.repository.CategoryRepo;
import com.royson.EcomBackend.repository.ProductRepo;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private ProductRepo productRepo;
    private CategoryRepo categoryRepo;

    public ProductService(ProductRepo productRepo,CategoryRepo categoryRepo){

        this.productRepo=productRepo;
        this.categoryRepo=categoryRepo;

    }

    public ProductResponse addProduct(ProductRequest request){

        ProductEntity product = new ProductEntity();

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setSellingPrice(request.getSellingPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setStatus(request.getStatus());

        CategoryEntity category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(()->new RuntimeException("Category Id not found"));

        product.setCategory(category);

        ProductEntity savedProduct = productRepo.save(product);

        return convertToResponse(savedProduct);
    }

    private ProductResponse convertToResponse(ProductEntity product) {

         return new ProductResponse(
                 product.getId(),
                 product.getName(),
                 product.getSku(),
                 product.getBrand(),
                 product.getDescription(),
                 product.getSellingPrice(),
                 product.getOriginalPrice(),
                 product.getStockQuantity(),
                 product.getImageUrl(),
                 product.getStatus(),
                 product.getCategory().getId(),
                 product.getCategory().getName(),
                 product.getCreatedAt(),
                 product.getUpdatedAt()
         );
    }
}
