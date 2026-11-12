package com.royson.EcomBackend.service;

import java.net.CacheRequest;
import java.util.List;

import com.royson.EcomBackend.entity.CategoryEntity;
import org.springframework.stereotype.Service;

import com.royson.EcomBackend.dto.CategoryResponse;
import com.royson.EcomBackend.dto.CategoryRequest;
import com.royson.EcomBackend.repository.CategoryRepo;

@Service 
public class CategoryService {
    private final CategoryRepo categoryRepo;

    public CategoryService(CategoryRepo categoryRepo){
        this.categoryRepo=categoryRepo;
    }

    public CategoryResponse addCategory(CategoryRequest request){

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

    public CategoryResponse getCategoryById(Long id){

        CategoryEntity category = categoryRepo.findById(id).orElseThrow(
                ()->new RuntimeException("Category not found: "+id)
        );

        return convertToResponse(category);
    }

    public CategoryResponse updateCategory(Long id,CategoryRequest request){

        CategoryEntity category = categoryRepo.findById(id).orElseThrow(
                ()->new RuntimeException("Category not found: "+id)
        );

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus());

        CategoryEntity updatedCategory = categoryRepo.save(category);

        return convertToResponse(updatedCategory);
    }

    public void deleteCategory(Long id){
        if(!categoryRepo.existsById(id)){
            throw new RuntimeException("Category not found "+id);
        }

        categoryRepo.deleteById(id);
    }

    private CategoryResponse convertToResponse(CategoryEntity category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getStatus(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
