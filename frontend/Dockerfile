# Usamos una imagen de Node 22
FROM node:22-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . ./

# Exponemos el puerto de React
EXPOSE 3001

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "start"]