# 🚀 Hướng dẫn tải và chạy

## 📥 Clone project về

```
git clone https://github.com/SU26-SWP391-EdTech/EdTech.git
```

## 📂 Truy cập vào project

```
cd EdTech
```

---

## ⚙️ Tạo file `.env` cho docker-compose

### WINDOWS (PowerShell / CMD)

```
Copy-Item .env.example .env
```

### LINUX / MAC

```
cp .env.example .env
```

---

## 🐳 Chạy Docker database

```
docker compose up -d db phpmyadmin
```

---

## 📦 Truy cập vào backend

```
cd backend/monolithic
```

---

## 📥 Cài dependencies

```
npm install
```

---

## ⚙️ Tạo file `.env` cho backend

> ⚠️ Backend cần `.env` riêng cho runtime (không phải `.env.docker`)

### WINDOWS

```
Copy-Item .env.example .env
```

### LINUX / MAC

```
cp .env.example .env
```

---

## 🐳 Tạo file `.env.docker` cho backend (Docker mode)

### WINDOWS

```
Copy-Item .env.docker.example .env.docker
```

### LINUX / MAC

```
cp .env.docker.example .env.docker
```

---

## ▶️ Chạy chương trình (development)

```
npm run start:dev
```

---

## 🐳 HOẶC chạy bằng Docker (full stack)

> ⚠️ Chỉ dùng khi:
> - đã có `.env.docker` trong backend
> - đã chạy `npm install`

```
docker compose up -d

# Frontend: http://localhost:3001/
# API SwaggerUI: http://localhost:3001/api/docs 
# or http://localhost:3000/docs
# MyPHPAdmin http://localhost:8080
# Backend API: http://localhost:3000/api/user
```

---

# 🔁 Khi thay đổi `.env` hoặc Docker config

## ♻️ Xóa toàn bộ database (reset sạch data)

```
docker compose down -v
docker compose up -d
```

---

## 🔍 Kiểm tra container

```
docker ps
```

| Command                   | Description                      |
| ------------------------- | -------------------------------- |
| `npm run start`           | Start all services               |
| `npm run start:build`     | Build and start all services     |
| `npm run start:database`  | Start only DB and phpMyAdmin     |
| `npm run down`            | Stop all services                |
| `npm run down:remove-all` | Stop services and remove volumes |
| `npm run restart`         | Restart all services             |
| `npm run restart:build`   | Rebuild and restart all services |
| `npm run logs`            | View container logs              |
| `npm run ps`              | Show container status            |
| `npm run rebuild`         | Rebuild images without cache     |
