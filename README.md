# MultiVendor Grocery API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![PM2](https://img.shields.io/badge/PM2-Ready-brightgreen.svg)](https://pm2.keymetrics.io/)

A comprehensive REST API for a multi-vendor grocery platform with user management, product catalog, order processing, and delivery tracking.

## � Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Tech Stack](#️-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Code Style](#-code-style)
- [License](#-license)
- [Resources](#-resources)

---

## �🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd multivendor-grocery

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Server runs on http://localhost:5000
```

---

## 📋 Prerequisites

- **Node.js** v16+
- **MongoDB** v4.4+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn**

---

## 🛠️ Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (3 types: User, Admin, Delivery)
- **File Upload**: Multer
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Process Manager**: PM2
- **CI/CD**: GitHub Actions

---

## ✨ Features

- 👥 User registration & authentication
- 🛡️ Separate admin & delivery personnel systems
- 📦 Product catalog with categories
- 🛒 Shopping cart management
- 📋 Order processing & tracking
- 🎫 Coupon system
- 🚚 Delivery management
- 🔔 Push notifications (Firebase FCM)
- 📤 Image uploads
- 📊 Logging & monitoring

---

## 📁 Project Structure

```
src/
├── app.js              # Express setup
├── index.js            # Entry point
├── core/               # DB, logger, firebase
├── models/             # Mongoose models
├── modules/            # Routes & controllers
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── orders/
│   ├── cart/
│   └── ...
├── shared/             # Utils, middlewares, services
└── tests/              # Test files
```

---

## 🔧 Environment Variables

Create `.env` file with these essential variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/multivendor-grocery

# Authentication
JWT_SECRET=your-super-secret-key
JWT_ADMIN_SECRET=your-admin-secret
JWT_DELIVERY_SECRET=your-delivery-secret

# Firebase (for notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Optional
PASSWORD_ENCRYPT_CODE=10
LOG_LEVEL=info
```

See `.env.example` for all available options.

---

## 🏃 Available Scripts

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Development with auto-reload |
| `npm start`             | Production server            |
| `npm test`              | Run tests                    |
| `npm run test:watch`    | Tests in watch mode          |
| `npm run test:coverage` | Coverage report              |
| `npm run format`        | Format code (Prettier)       |
| `npm run pm2:start`     | Start with PM2               |
| `npm run pm2:restart`   | Restart PM2                  |
| `npm run pm2:logs`      | View PM2 logs                |

---

## 📚 API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT tokens via cookies or headers

**Available modules:** Auth, Users, Admin, Products, Categories, Cart, Orders, Coupons, Banners, Delivery, Shipping, Notifications

For complete API documentation, explore the routes in `src/modules/{module-name}/` or use tools like Postman/Insomnia.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Tests use MongoDB Memory Server for isolation.

---

## 🚀 Deployment

### 🖥️ Production Server Setup (CentOS/RHEL 8)

**Server:** vps.leatherkart.com.au

```bash
# 1. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Clone & setup
cd /var/www
git clone <your-repo> multivendor-grocery
cd multivendor-grocery
npm install --production
cp .env.example .env
nano .env  # Configure

# 4. Start with PM2
npm run pm2:start
pm2 save
pm2 startup  # Follow instructions

# 5. Configure firewall
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

### 🔄 GitHub Actions Auto-Deploy

1. **Generate SSH key** on server:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # Copy private key
```

2. **Add GitHub Secrets** (Settings → Secrets → Actions):
   - `SERVER_HOST`: `vps.leatherkart.com.au`
   - `SERVER_USERNAME`: Your SSH username
   - `SSH_PRIVATE_KEY`: Private key from above
   - `PROJECT_PATH`: `/var/www/multivendor-grocery`
   - `SERVER_PORT`: `22`

3. **Push to main branch** → Auto-deploys! 🎉

---

### ⚙️ PM2 Commands

```bash
pm2 status                        # Check status
pm2 logs multivendor-grocery-api  # View logs
pm2 restart all                   # Restart
pm2 monit                         # Monitor
```

---

## 🐛 Troubleshooting

**Port in use:**

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

**MongoDB connection:**

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**PM2 not starting:**

```bash
pm2 delete all
npm run pm2:start
pm2 logs --err
```

**Git pull fails:**

```bash
git reset --hard origin/main
git pull
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/name`
3. Make changes & test: `npm test`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/name`
6. Create Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests

---

## 📝 Code Style

- ES6+ modules
- Prettier for formatting
- ESLint for linting
- Run `npm run format` before commit

---

## 📄 License

ISC License

---

## 🔗 Resources

- [Node.js Docs](https://nodejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Jest Testing](https://jestjs.io/)

---

**Built with ❤️ | Last Updated: February 18, 2026**
