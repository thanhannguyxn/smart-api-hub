# ==========================================
# Stage 1: Builder - Cài đặt & Biên dịch TS
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file cấu hình và cài đặt TẤT CẢ thư viện (bao gồm devDependencies)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy mã nguồn và tiến hành build sang JS
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production - Môi trường chạy thực tế siêu nhẹ
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Khai báo môi trường Production
ENV NODE_ENV=production

# Chỉ copy package.json và cài đặt thư viện lõi (bỏ qua devDependencies)
# Mẹo: Dùng `npm ci` thay vì `npm i` giúp quá trình build trên server ổn định và chuẩn xác hơn
COPY package*.json ./
RUN npm ci --omit=dev

# Chỉ copy thư mục đã build (dist) và file dữ liệu mẫu từ Stage 1
COPY --from=builder /app/dist ./dist
COPY db.json ./

# Bảo mật: Dùng user "node" có sẵn thay vì "root"
USER node

# Mở cổng 3000
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["node", "dist/index.js"]