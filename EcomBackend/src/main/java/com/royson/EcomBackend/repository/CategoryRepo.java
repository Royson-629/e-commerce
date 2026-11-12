package com.royson.EcomBackend.repository;

import com.royson.EcomBackend.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<CategoryEntity,Long> {
    
}
