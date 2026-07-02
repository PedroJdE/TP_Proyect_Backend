# TP Workspaces - Backend API

## Repositorios del proyecto

| Componente | Repositorio |
|------------|-------------|
| 🎨 Frontend | https://github.com/PedroJdE/TP-workspaces-Frontend |
| ⚙️ Backend | https://github.com/PedroJdE/TP_Proyect_Backend |

---

## Aplicación desplegada

| Servicio | URL |
|----------|-----|
| 🌐 Frontend | https://tp-workspaces-frontend.vercel.app |
| 🔗 Backend API | https://tp-proyect-backend.vercel.app |

---

## Descripción

**TP Workspaces** es una API REST desarrollada con **Node.js**, **Express** y **MongoDB** que implementa el backend de una plataforma colaborativa inspirada en aplicaciones como Slack y Microsoft Teams.

La aplicación permite que múltiples usuarios trabajen de forma colaborativa dentro de distintos **Workspaces**, organizando la comunicación mediante **canales**, administrando miembros con diferentes niveles de permisos e intercambiando mensajes.

El sistema implementa autenticación mediante **JWT**, verificación de cuentas por correo electrónico y un mecanismo de invitaciones para incorporar nuevos usuarios a los distintos espacios de trabajo.

La arquitectura del proyecto fue desarrollada siguiendo una separación por capas (Controllers, Services, Repositories y Models), facilitando su mantenimiento, escalabilidad y reutilización.

---

# Objetivos

La API fue diseñada para resolver las necesidades de comunicación y organización de equipos de trabajo.

Entre sus principales funcionalidades se encuentran:

- Registro e inicio de sesión de usuarios.
- Verificación de cuentas mediante correo electrónico.
- Recuperación de contraseña.
- Creación y administración de Workspaces.
- Gestión de miembros.
- Sistema de invitaciones mediante correo electrónico.
- Administración de canales.
- Envío y consulta de mensajes.
- Gestión del perfil del usuario autenticado.

---

# Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Nodemailer
- bcrypt
- dotenv

---

# Arquitectura General

```
                    React Frontend
                           │
                      HTTP REST API
                           │
                           ▼
                    Express Backend
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    Controllers        Services      Repositories
                           │
                           ▼
                        MongoDB
```

La aplicación sigue una arquitectura en capas donde cada componente posee una única responsabilidad.

- **Controllers** reciben las solicitudes HTTP.
- **Services** contienen la lógica de negocio.
- **Repositories** encapsulan el acceso a la base de datos.
- **Models** representan las entidades persistidas en MongoDB.

---

# Funcionamiento del sistema

La organización de la aplicación sigue una estructura jerárquica.

```
Usuario
   │
   ▼
Workspace
   │
   ├──────── General
   │
   ├──────── Desarrollo
   │
   ├──────── Diseño
   │
   └──────── Testing
```

Cada usuario puede pertenecer a uno o varios Workspaces.

Cada Workspace puede contener múltiples canales.

Los mensajes siempre pertenecen a un canal específico.

---

# Flujo general del sistema

```
Registro
    │
    ▼
Verificación por Email
    │
    ▼
Login
    │
    ▼
JWT
    │
    ▼
Crear Workspace
    │
    ├────────► Se crea automáticamente el canal General
    │
    ▼
Invitar miembros
    │
    ▼
Crear nuevos canales
    │
    ▼
Seleccionar qué miembros pertenecen a cada canal
    │
    ▼
Enviar y consultar mensajes
```

---

# Flujo de autenticación

```
Usuario
   │
   ▼
POST /auth/register
   │
   ▼
Cuenta creada
   │
   ▼
Correo de verificación
   │
   ▼
GET /verify-email
   │
   ▼
Cuenta verificada
   │
   ▼
POST /login
   │
   ▼
JWT
   │
   ▼
Acceso a endpoints protegidos
```

---

# Creación de un Workspace

Cuando un usuario crea un Workspace, el sistema realiza automáticamente las siguientes acciones:

- crea el nuevo Workspace;
- asigna al usuario creador el rol **OWNER**;
- crea automáticamente un canal denominado **General**;
- agrega al OWNER como miembro de dicho canal.

El canal **General** constituye el espacio inicial de comunicación del Workspace y representa el canal común para todos los integrantes.

```
Usuario
    │
    ▼
Crear Workspace
    │
    ▼
Workspace creado
    │
    ├────────► Usuario asignado como OWNER
    │
    └────────► Creación automática del canal General
```

---

# Gestión de miembros

Los usuarios pueden incorporarse a un Workspace mediante un sistema de invitaciones.

El OWNER invita al usuario indicando su dirección de correo electrónico.

El sistema genera un token de invitación y envía un correo electrónico con el enlace correspondiente.

Una vez aceptada la invitación, el usuario pasa a formar parte del Workspace y obtiene acceso al canal **General**.

```
OWNER
   │
   ▼
Invitar usuario
   │
   ▼
Generar token
   │
   ▼
Enviar Email
   │
   ▼
Aceptar invitación
   │
   ▼
Usuario agregado al Workspace
   │
   ▼
Acceso al canal General
```

---

# Gestión de canales

Cada Workspace dispone inicialmente de un único canal denominado **General**.

Posteriormente, el **OWNER** o cualquier usuario con rol **ADMIN** puede crear nuevos canales para organizar la comunicación del equipo.

Durante la creación del canal es posible seleccionar qué miembros del Workspace formarán parte del mismo.

De esta forma es posible organizar conversaciones independientes para distintos proyectos, equipos o áreas de trabajo.

```
OWNER / ADMIN
       │
       ▼
Crear Canal
       │
       ▼
Seleccionar miembros
       │
       ▼
Guardar Canal
       │
       ▼
Los miembros seleccionados pasan a integrar el canal
```

---

# Mensajería

La comunicación entre los usuarios se realiza dentro de los canales.

Cada mensaje pertenece exclusivamente al canal donde fue enviado.

Los usuarios únicamente pueden consultar y enviar mensajes en aquellos canales de los que forman parte.

```
Usuario
   │
   ▼
Selecciona Canal
   │
   ▼
Obtiene historial
   │
   ▼
Envía mensaje
   │
   ▼
Mensaje almacenado
```

---

# Roles y permisos

## OWNER

Es el creador del Workspace y posee control total sobre él.

Puede:

- crear el Workspace;
- invitar nuevos miembros;
- crear canales;
- administrar la composición de los canales;
- participar en todos los canales.

---

## ADMIN

Es un miembro con permisos administrativos dentro del Workspace.

Puede:

- crear nuevos canales;
- administrar los canales existentes;
- seleccionar qué miembros formarán parte de cada canal;
- colaborar en la organización del Workspace.

---

## USER

Es un miembro estándar del Workspace.

Puede:

- acceder únicamente a los canales de los que forma parte;
- consultar mensajes;
- enviar mensajes;
- participar en las conversaciones.

---

# API Reference

## Authentication

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| POST | `/api/auth/register` | Registrar un nuevo usuario. |
| POST | `/api/auth/login` | Autenticar un usuario y obtener un JWT. |
| GET | `/api/auth/verify-email` | Verificar la cuenta mediante el token recibido por correo. |
| POST | `/api/auth/request-password-reset` | Solicitar recuperación de contraseña. |
| POST | `/api/auth/reset-password` | Restablecer la contraseña utilizando el token recibido. |

---

## Workspaces

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| POST | `/api/workspace` | Crear un nuevo Workspace. |
| GET | `/api/workspace` | Obtener todos los Workspaces del usuario autenticado. |
| GET | `/api/workspace/:workspaceId/members` | Obtener los miembros del Workspace. |
| POST | `/api/workspace/:workspaceId/invite` | Invitar un usuario al Workspace. |

---

## Channels

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | `/api/workspace/:workspaceId/channels` | Obtener los canales del Workspace. |
| POST | `/api/workspace/:workspaceId/channels` | Crear un nuevo canal. |
| PUT | `/api/workspace/:workspaceId/channels/:channelId` | Actualizar la información de un canal. |

---

## Messages

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | `/api/channels/:channelId/messages` | Obtener el historial de mensajes del canal. |
| GET | `/api/channels/:channelId/messages/new` | Obtener únicamente los mensajes nuevos desde una fecha determinada. |
| POST | `/api/channels/:channelId/messages` | Enviar un nuevo mensaje al canal. |

---

## Profile

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | `/api/profile` | Obtener la información del usuario autenticado. |

---

# Flujo recomendado para consumir la API

1. Registrar un nuevo usuario.
2. Verificar la cuenta mediante el correo recibido.
3. Iniciar sesión.
4. Obtener el JWT.
5. Crear un Workspace.
6. Invitar nuevos miembros.
7. Crear canales adicionales.
8. Incorporar miembros a cada canal.
9. Consultar y enviar mensajes.

---

# Códigos HTTP utilizados

| Código | Descripción |
|---------|-------------|
| 200 | Solicitud procesada correctamente. |
| 201 | Recurso creado correctamente. |
| 400 | Error en la solicitud. |
| 401 | Usuario no autenticado. |
| 403 | El usuario no posee permisos suficientes. |
| 404 | Recurso inexistente. |
| 409 | Conflicto con un recurso existente. |
| 500 | Error interno del servidor. |

---

# Colección Postman

El proyecto incluye una colección de Postman con todos los endpoints documentados y ejemplos de uso para facilitar las pruebas de la API.

La colección contiene ejemplos de autenticación, creación de Workspaces, invitación de usuarios, administración de canales, mensajería y gestión del perfil del usuario autenticado.