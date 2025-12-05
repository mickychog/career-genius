# 🛠️ Documentación Técnica - Backend (NestJS)

El backend de **CareerGenius** está construido con **NestJS**, un
framework eficiente y escalable para Node.js. Proporciona una **API
RESTful** documentada con Swagger.

------------------------------------------------------------------------

## 1. Estructura de Módulos

El sistema está dividido en módulos funcionales para mantener una
arquitectura limpia y modular:

### 🔐 AuthModule

-   Maneja autenticación (Login/Registro) con **JWT** y
    **Passport.js**.\
-   Incluye estrategia de **Google OAuth**.

### 👤 UsersModule

-   Gestiona perfiles de usuario.\
-   Calcula estadísticas del Dashboard mediante `getUserDashboardStats`.

### 🧠 VocationalTestModule

-   Contiene la lógica del algoritmo **"Embudo Vocacional"**.\
-   Maneja transiciones de estado:\
    `GENERAL → SPECIFIC → CONFIRMATION`\
-   Almacena y recupera sesiones del test.

### 🤖 AiModule

-   Servicio centralizado para comunicarse con **Google Gemini**.\
-   Implementa `responseMimeType: "application/json"` para garantizar
    respuestas estructuradas y evitar errores de parseo.

### 🎓 UniversitySearchModule

-   Gestiona búsqueda y persistencia de recomendaciones universitarias.

### 📚 SkillsDevelopmentModule

-   Gestiona generación de planes de estudio y cursos personalizados.

------------------------------------------------------------------------

## 2. Algoritmo de Test Vocacional

El `VocationalTestService` implementa una **máquina de estados finitos
(FSM)**:

### 🔹 Fase General (5 preguntas)

-   Filtra intereses macro.\
-   **Cálculo:** se seleccionan las **2 áreas con mayor puntaje**.

### 🔹 Fase Específica (6 preguntas)

-   Profundiza únicamente en las 2 áreas seleccionadas.\
-   **Cálculo Final:** determina el área ganadora absoluta.

### 🔹 Fase Confirmación (5 preguntas)

-   Definición del rol específico dentro del área final.

------------------------------------------------------------------------

## 3. Comandos Útiles (Desarrollo Manual)

Para ejecutar el backend sin Docker:

``` bash
cd backend
npm install
npm run start:dev
```

El servidor arrancará en:

**http://localhost:3000**
