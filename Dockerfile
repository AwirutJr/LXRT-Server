# LXRT/Dockerfile

FROM node:18

# สร้าง app directory
WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# ก๊อปโค้ดทั้งหมด
COPY . .

# สร้าง Prisma Client
RUN npx prisma generate

# เปิด port
EXPOSE 5000

# รัน server
CMD ["node", "server.js"]
