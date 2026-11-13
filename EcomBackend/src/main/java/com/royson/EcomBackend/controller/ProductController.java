package com.royson.EcomBackend.controller;

import com.royson.EcomBackend.dto.ProductRequest;
import com.royson.EcomBackend.dto.ProductResponse;
import com.royson.EcomBackend.service.ProductService;
import com.royson.EcomBackend.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;


import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private ProductService productService;
    private final CloudinaryService cloudinaryService;

    public ProductController(
            ProductService productService,
            CloudinaryService cloudinaryService) {

        this.productService = productService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    public ProductResponse addProduct(@RequestBody ProductRequest request){
        return productService.addProduct(request);
    }

    @GetMapping
    public List<ProductResponse> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductByid(@PathVariable Long id){
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable Long id,@RequestBody ProductRequest request){
        return productService.updateProduct(id,request);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id){
        productService.deleteProduct(id);
        return "Product Deleted Successfully";
    }

    @PostMapping("/images/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file)
            throws IOException {

        return cloudinaryService.uploadImage(file);
    }


    @GetMapping("/search")
    public List<ProductResponse> searchProducts(
            @RequestParam String query) {

        return productService.searchProducts(query);
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId) {

        return productService.getProductsByCategory(categoryId);
    }

    @GetMapping("/status/{status}")
    public List<ProductResponse> getProductsByStatus(
            @PathVariable String status) {

        return productService.getProductsByStatus(status);
    }

}
