#!/bin/bash

# Título
echo "================================================="
echo "     INICIANDO CAREER GENIUS - PLATAFORMA IA"
echo "================================================="
echo ""

# 1. Verificar Docker
echo "[1/4] Verificando Docker..."
if ! command -v docker &> /dev/null
then
    echo "[ERROR] Docker no está instalado o no está en el PATH."
    echo "Por favor instala Docker y vuelve a intentarlo."
    exit 1
fi

# Verificar si el servicio Docker está corriendo
if ! systemctl is-active --quiet docker; then
    echo "[AVISO] El servicio Docker no está corriendo. Intentando iniciar..."
    sudo systemctl start docker
fi

echo "[OK] Docker detectado."
echo ""

# 2. Levantar servicios
echo "[2/4] Levantando servicios (Backend + Frontend + BD)..."
echo "Esto puede tardar unos minutos la primera vez..."

# Cambiar al directorio del código fuente
cd 01_Codigo_Fuente || { echo "No se encuentra la carpeta 01_Codigo_Fuente"; exit 1; }

# Levantar contenedores
sudo docker-compose up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Fallo al levantar docker-compose."
    echo "Asegúrate de tener permisos (quizás necesites sudo) o que los puertos 3000/3001 estén libres."
    exit 1
fi

echo ""
echo "[3/4] Esperando a que los servicios estén listos..."
sleep 15

# 3. Abrir navegador
echo ""
echo "[4/4] Abriendo la aplicación en tu navegador..."

if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:3001
else
    echo "No se pudo abrir el navegador automáticamente. Por favor entra a http://localhost:3001"
fi

echo ""
echo "================================================="
echo "     PROYECTO CORRIENDO EXITOSAMENTE"
echo "     Frontend: http://localhost:3001"
echo "     Backend API: http://localhost:3000/api-docs"
echo "================================================="
echo ""
echo "Para detener el proyecto, ejecuta: sudo docker-compose down"
read -p "Presiona Enter para salir..."