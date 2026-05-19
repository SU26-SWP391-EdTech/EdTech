# Hướng dẫn tải và chạy backend
## Clone project về
```
git clone https://github.com/SU26-SWP391-EdTech/EdTech.git
```
## truy cập vào project
```
cd EdTech
```
## Tạo file .env cho docker-compose và chỉnh sửa biến môi trường
### WINDOWS (PowerShell/CMD)
```
copy-Item .env.example .env
```
### LINUX
```
touch .env
cp .env.example .env
```
## chạy docker database
```
docker compose up -d
```
## truy cập vào trong backend 
```
cd backend/monolithic
```
## tải gói packages 
```
npm install
```
## Tạo file .env trong backend

### WINDOWS (PowerShell/CMD)
```
Copy-Item .env.example -Destination .env
```
### LINUX
```
touch .env
cp .env.example .env
```
## Chạy chương trình
```
npm run start:dev
```
# Trường hợp thay đổi biến môi trường của docker compose xong
## xóa volume để áp dụng cái mới
```
docker compose down -v
docker compose up -d
```
## kiểm tra docker
```
docker ps
```
---

