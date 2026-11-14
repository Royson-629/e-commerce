# 🛒 E-Commerce Admin Dashboard

A full-stack E-Commerce Admin Dashboard built primarily to explore and implement backend development using **Java and Spring Boot**.

The application provides a centralized interface for managing products, categories, pricing, inventory, and product images. It uses REST APIs to connect the React frontend with the Spring Boot backend.

🌐 **Live Demo:** [View Application](https://frontend-roan-kappa-1cnwum2q30.vercel.app)

---

## 📸 Project Overview

This application allows administrators to manage essential e-commerce data through a web-based dashboard.

### ✨ Features

- **Product Management:** Add, view, edit, and delete products.
- **Category Management:** Manage product categories.
- **Inventory Management:** Update stock quantities.
- **Pricing Management:** Manage selling prices and product details.
- **Image Uploads:** Upload and store product images using Cloudinary.
- **REST API Integration:** Connect the frontend with the backend.
- **Database Integration:** Store and retrieve application data using PostgreSQL.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Java 21 | Backend programming |
| Spring Boot | Backend framework |
| Spring Data JPA | Database operations |
| React.js | Frontend development |
| Vite | Frontend build tool |
| PostgreSQL | Relational database |
| Supabase | Hosted PostgreSQL database |
| Cloudinary | Product image storage |
| Axios | HTTP requests and API communication |
| Maven | Backend dependency management |
| Git & GitHub | Version control |

### ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase
- **Image Storage:** Cloudinary

---

## 🏗️ Application Architecture

```text
                 ADMIN
                   |
                   v
          React + Vite Frontend
                   |
                 Axios
                   |
                   v
          Spring Boot Backend
                   |
          REST API Endpoints
                   |
          +--------+--------+
          |                 |
          v                 v
      PostgreSQL         Cloudinary
      (Supabase)        Image Storage
```

---

## 🎯 My Role & Learning Experience

My primary focus in this project was **Java Backend Development**.

I worked on implementing the backend using Spring Boot, developing REST APIs, managing database operations, and integrating PostgreSQL and Cloudinary.

For the frontend, I used AI-assisted development to build most of the React implementation. I then explored the generated code, understood how the frontend communicated with the backend, and worked through integration and deployment issues with a combination of AI assistance and my own debugging.

This project helped me gain practical experience in:

- Developing RESTful APIs using Spring Boot.
- Implementing CRUD operations.
- Working with PostgreSQL and JPA.
- Integrating cloud-based image storage.
- Connecting frontend and backend applications.
- Managing environment variables.
- Deploying applications to cloud platforms.
- Troubleshooting production issues, including CORS.

---

## 🚀 Running the Project Locally

### Prerequisites

Make sure you have installed:

- Java 21
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Royson-629/e-commerce.git
cd e-commerce
```

### 2. Run the Backend

Navigate to the backend directory:

```bash
cd EcomBackend
```

Configure the required environment variables:

```env
DB_URL=jdbc:postgresql://localhost:5432/ecommerce_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the Spring Boot application:

**Windows:**

```bash
mvnw.cmd spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

### 3. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## 🌍 Live Deployment

The application is deployed using cloud hosting services.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |
| Images | Cloudinary |

**Live Application:** https://frontend-roan-kappa-1cnwum2q30.vercel.app

> **Deployment Note:** The backend uses Render's free tier, which may experience cold starts after periods of inactivity. Initial requests can take longer while the backend starts up.

---

## 👨‍💻 Developer

**Royson Adrin Menezes**

- GitHub: [Royson-629](https://github.com/Royson-629)
- Portfolio: [royson-portfolio.vercel.app](https://royson-portfolio.vercel.app)
- LinkedIn: Add your LinkedIn profile URL here.

---

*Built as a hands-on learning project with a primary focus on Java Backend Development, Spring Boot, and REST API integration.* 🚀
