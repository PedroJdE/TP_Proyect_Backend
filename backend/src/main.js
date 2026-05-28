import environment from "./config/environment.js";
import User from "./models/user.model.js";
import express from "express";
import dns from 'dns';
import authMiddleware from "./middlewares/auth.middleware.js";

console.log(environment.MONGO_DB_CONNECTION_STRING);
console.log(environment.MONGO_DB_NAME);

if (environment.MODE === "development") {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

import connectMongoDB from "./config/mongodb.config.js";
connectMongoDB();

import authRouter from "../routes/API.auth.js";
import userRepository from "./repositories/user.repository.js";
import workspaceMembersRepository from "./repositories/workspaceMembers.repository.js";
import workspaceRepository from "./repositories/workspace.repository.js";
import Workspace from "./models/workspace.model.js";
import WorkspaceMember from "./models/workspaceMembers.model.js";
import workspaceRouter from "../routes/workspace.router.js";

const app = express();
// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

app.use('/api/workspace', workspaceRouter);

const PORT = environment.PORT || 3000;
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/`);
});

/*userRepository.create("Pedro", "pedrojuliandeelias@gmail.com", "password123");*/
/*userRepository.create("Teresa", "teresa@gmail.com", "password456");*/
//userRepository.create("Maria", "maria@gmail.com", "password789");

/* 
Ruta: /api/workspace


    controlador: workspaceController
        post() Debe estar con el authMiddleware
            Validar nombre y descripcion (opcional)
            Crear un espacio de trabajo
            Crear una membresia de role tipo 'dueño' a nombre del id del cliente consultante.
            
            body: {
                nombre,
                descripcion
            }
            

*/



/* 
Un endpoint donde el cliente debera enviarnos por header de autorizacion el access token, en caso de estar presente y ser correcto
Le daremos los datos de la cuenta
*/
app.get(
    '/api/profile', 
        /*  (request, response, next) => {
        const random_num = Math.random() 
        console.log('Numero aleatorion generado:', random_num)
        if(random_num > 0.5){
            return response.json({
                message:"Mala suerte campeon ☠"
            })
        }
        else{
            next()
        }
    }, */
    authMiddleware,
    (request, response) => {
        console.log(
            'Nombre del cliente:',
            request.user.nombre
        )
        return response.json({
            ok: true,
            status: 200,
            message: "Estas autenticado"
        })
    }
)


