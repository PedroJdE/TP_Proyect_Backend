import express from 'express';
import authController from '../controllers/auth.controller.js';
import workspaceController from '../controllers/workspace.controller.js';

const authRouter = express.Router()

authRouter.post(
    '/register',
    authController.register
)

authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

authRouter.post(
    '/login',
    authController.login
)

export default authRouter;
/* 

Crear una API de express

Route:
    /api/auth
        POST /register
            body: {name, email, password}
            Crear un usuario en la DB
            Validar que el usuario tenga nombre mayor a 2 caracteres
            Validar email
            Validar password con almenos 6 caracteres 

Mas Adelante...
        POST /login
RECOMENDACION:
    El controller puede ser asincrono!!
    authRouter.post(
        '/register', 
        async (request, response) => {
            await userRepository.create('pepe')
        }
    )
*/