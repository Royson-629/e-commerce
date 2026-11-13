
package com.royson.EcomBackend.service;

import java.util.List;

import com.royson.EcomBackend.entity.CategoryEntity;
import com.royson.EcomBackend.repository.ProductRepo;
import org.springframework.stereotype.Service;

import com.royson.EcomBackend.dto.CategoryResponse;
import com.royson.EcomBackend.dto.CategoryRequest;
import com.royson.EcomBackend.repository.CategoryRepo;

@Service
public class CategoryService {

    private final CategoryRepo categoryRepo;
    private final ProductRepo productRepo;

    public CategoryService(
            CategoryRepo categoryRepo,
            ProductRepo productRepo
    ) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
    }

    public CategoryResponse addCategory(CategoryRequest request) {

        CategoryEntity category = new CategoryEntity();

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());

        CategoryEntity savedCategory = categoryRepo.save(category);

        return convertToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories() {

        return categoryRepo.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {

        CategoryEntity category = categoryRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Category not found: " + id)
        );

        return convertToResponse(category);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {

        CategoryEntity category = categoryRepo.findById(id).orElseThrow(
                () -> new RuntimeException("Category not found: " + id)
        );

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());

        CategoryEntity updatedCategory = categoryRepo.save(category);

        return convertToResponse(updatedCategory);
    }

    public void deleteCategory(Long id) {

        if (!categoryRepo.existsById(id)) {
            throw new RuntimeException("Category not found: " + id);
        }

        categoryRepo.deleteById(id);
    }

    private CategoryResponse convertToResponse(CategoryEntity category) {

        Long linkedProducts = productRepo.countByCategory_Id(category.getId());

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getStatus(),
                linkedProducts,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
