# MultiVendor Grocery API

A comprehensive REST API for a multi-vendor grocery platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: User registration, authentication, and profile management
- **Product Catalog**: Product management with categories and subcategories
- **Category System**: Hierarchical category and subcategory organization
- **Banner Management**: Dynamic banner management for marketing
- **Authentication**: JWT-based stateless authentication
- **File Uploads**: Support for product images and user avatars
- **Logging**: Structured logging with Winston
- **Error Handling**: Centralized error handling with custom API errors
- **Testing**: Comprehensive test suite with Jest and Supertest

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Logging**: Winston with daily rotate file
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd multivendor-grocery
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=365d
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### User Endpoints

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### Category Endpoints

- `GET /categories` - Get all categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Product Endpoints

- `GET /products` - Get all products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Banner Endpoints

- `GET /banners` - Get all banners
- `POST /banners` - Create new banner
- `PUT /banners/:id` - Update banner
- `DELETE /banners/:id` - Delete banner

## 🗂️ Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js               # Server entry point
├── core/                  # Core functionality
│   ├── db/               # Database connection
│   └── logger/           # Logging configuration
├── models/               # Mongoose models
│   ├── auth.model.js
│   ├── banner.model.js
│   ├── category.model.js
│   ├── product.model.js
│   └── user.model.js
├── modules/              # Feature modules
│   ├── auth/
│   ├── banner/
│   ├── category/
│   ├── products/
│   └── users/
└── shared/               # Shared utilities
    ├── middlewares/
    ├── utils/
    └── validators/
```

## 🧪 Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage report:

```bash
npm run test:coverage
```

## 📝 Code Quality

Format code:

```bash
npm run format
```

Check code formatting:

```bash
npm run check-format
```

## 🔧 Environment Variables

| Variable      | Description               | Default |
| ------------- | ------------------------- | ------- |
| `PORT`        | Server port               | `5000`  |
| `MONGODB_URI` | MongoDB connection string | -       |
| `JWT_SECRET`  | JWT secret key            | -       |
| `JWT_EXPIRES` | JWT expiration time       | `365d`  |
