# ANF — Laravel 11 + Inertia (React)

Sistema ANF con **Laravel 11**, **Inertia** y **React**.  
Login propio usando 3 tablas de BD: `Usuario`, `OpcionForm`, `AccesoUsuario`.

> 👉 Este README está pensado para **cada compañero** que vaya a clonar y correr el proyecto en su PC (Windows 11 + Laragon recomendado).

---

## Requisitos

- **Windows 11** con **[Laragon](https://laragon.org/)** (incluye Apache, MySQL 8, PHP 8.3+).
- **Git**
- **Composer**
- **Node.js 18+** y **npm**

---

## TL;DR (arranque rápido)

```bash
git clone https://github.com/DanielAvelar02/ANF-Proyecto.git
cd ANF-Proyecto

composer install
cp .env.example .env
php artisan key:generate

# Crea la BD 'anf' en MySQL (utf8mb4) desde Laragon/HeidiSQL
# Abre .env, ajusta DB_* y APP_URL (ver sección Configuración de entorno)

npm install

# Opción A
php artisan migrate --seed

# Opción B, sino funciona pedir el script SQL

npm run dev
# Con Laragon (vhost .test):
#   abrir http://anf-app.test/login
# Con php artisan serve:
#   php artisan serve   -> http://127.0.0.1:8000/login
