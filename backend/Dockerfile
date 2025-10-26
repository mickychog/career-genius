# ---- Etapa 1: Build ----
# Usamos una imagen de Node 18
FROM node:22-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY backend/package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código del backend
COPY backend/ ./

# Construimos la aplicación de producción
RUN npm run build

# ---- Etapa 2: Producción ----
# Usamos una imagen más ligera
FROM node:22-alpine

WORKDIR /app

# Copiamos solo los artefactos de build de la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Exponemos el puerto 3000
EXPOSE 3000

# El comando para correr la app
CMD ["node", "dist/main"]