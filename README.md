# 🎯 CareerGenius --- Plataforma de Orientación Vocacional con IA

## 1. Descripción del Proyecto

**CareerGenius** es una WebApp innovadora diseñada específicamente para
el contexto educativo y laboral de Bolivia. Utiliza **Inteligencia
Artificial avanzada (Google Gemini 1.5)** para ofrecer un ecosistema
completo de orientación vocacional y académica.

### 🔧 Módulos Principales

-   **🧠 Test Vocacional Adaptativo**\
    Algoritmo inteligente de 3 fases:\
    **1) Filtro General**, **2) Profundización Específica**, **3)
    Confirmación de Rol**.\
    Las preguntas se ajustan en tiempo real según las respuestas del
    usuario.

-   **🏫 Buscador de Universidades**\
    Recomendaciones de universidades e institutos bolivianos (públicos y
    privados) con información detallada sobre:

    -   costos,\
    -   requisitos de admisión,\
    -   ubicación geográfica,\
    -   modalidades de estudio.

-   **📚 Desarrollo de Habilidades**\
    Generación automática de planes de estudio personalizados con
    recursos gratuitos (YouTube, plataformas web).\
    Enfocado en preuniversitarios y fundamentos de carrera.

-   **📊 Dashboard Dinámico**\
    Panel que muestra:

    -   progreso del usuario,\
    -   estadísticas del perfil vocacional,\
    -   fechas importantes de admisión en Bolivia.

------------------------------------------------------------------------

## 2. Documentación Técnica General

El proyecto utiliza una arquitectura **Modular Monolith (Micro-servicios
Monolíticos)**, contenerizada para facilitar el despliegue y escalar de
forma segura.

### 🧱 Stack Tecnológico

  -------------------------------------------------------------------------------
  Capa                  Tecnología                  Descripción
  --------------------- --------------------------- -----------------------------
  **Frontend**          React 18                    Librería UI basada en
                                                    componentes.

  **Lenguaje**          TypeScript                  Superset de JS con tipado
                                                    estático.

  **Backend**           NestJS                      Framework progresivo para
                                                    Node.js.

  **Base de Datos**     MongoDB                     Base NoSQL, usando MongoDB
                                                    Atlas.

  **IA**                Google Gemini 2.5           Modelo para análisis y
                                                    generación inteligente.

  **Infraestructura**   Docker                      Contenerización y despliegue
                                                    portátil.
  -------------------------------------------------------------------------------

### 🗂️ Arquitectura de Datos (Esquemas Principales)

-   **User**\
    Credenciales, datos demográficos, rol y perfil vocacional.

-   **Question**\
    Banco de preguntas organizadas por categoría:\
    `GENERAL`, `SPECIFIC`, `CONFIRMATION`.

-   **TestSession**\
    Registra estado del test, respuestas, puntajes y resultado final del
    usuario.

------------------------------------------------------------------------

## 3. Instrucciones de Ejecución Rápida

El proyecto incluye scripts de inicio rápido para automatizar el despliegue de contenedores en Windows y Linux.

🪟 Opción A: Windows

1. Navega a la carpeta raíz del entregable (Entregable_CareerGenius).

2. Haz doble clic en el archivo:
Iniciar_Proyecto.bat

3. Se abrirá una consola de comandos. Espera a que el proceso termine de levantar los servicios.

4. El navegador se abrirá automáticamente con la aplicación lista.

🐧 Opción B: Linux (Fedora / Ubuntu)

1. Abre una terminal en la carpeta raíz del entregable.

2. Otorga permisos de ejecución al script:

    ``` bash
    chmod +x Iniciar_Proyecto.sh
    ```

3.  Ejecuta el script:

    ``` bash
    ./Iniciar_Proyecto.sh
    ```

4.  Accede a los servicios:

    -   **Frontend:** http://localhost:3001\
    -   **Swagger API:** http://localhost:3000/api-docs

------------------------------------------------------------------------

## 4. Credenciales y Variables

El proyecto incluye un archivo **`.env` preconfigurado**.

> **Nota:**\
> La API Key de *Google Gemini* incluida es únicamente para fines
> demostrativos y cuenta con cuotas gratuitas limitadas.

------------------------------------------------------------------------

## 👤 Desarrollado por

**MIGUEL ANGEL CHOQUE GARCIA**\
**Universidad:** SAN FRANCISCO XAVIER DE CHUQUISACA\
**Año:** 2025
