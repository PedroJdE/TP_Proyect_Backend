import userRepository from "../src/repositories/user.repository.js";
import ServerError from "../src/helpers/serverError.helper.js";
import bcrypt from 'bcrypt';
import mailer_transport from "../src/config/mailer.config.js";
import ENVIRONMENT from "../src/config/environment.js";
import jwt from 'jsonwebtoken'

const URL_BACKEND = ENVIRONMENT.URL_BACKEND; // Using environment variable

function verifyEmailTemplate(email, verifyToken) {
    return `
        <a
            href='${URL_BACKEND}/api/auth/verify-email?verifyToken=${verifyToken}&email=${email}'>
            click aqui para verificar
        </a>`;
}

export async function sendVerifyEmail(email, verifyToken) {
    const mailOptions = {
        from: ENVIRONMENT.GMAIL_USERNAME,
        to: email,
        subject: 'Verificación de correo electrónico',
        html: verifyEmailTemplate(email, verifyToken)
    };
    await mailer_transport.sendMail(mailOptions);
}

class AuthController {
    async register(request, response) {
        try {
            const { name, email, password } = request.body;
            if (!name || name.length < 2) {
                return response.status(400).json({
                    error: "Name must be at least 2 characters long"
                });
            }
            if (!email || !email.includes("@")) {
                return response.status(400).json({
                    error: "Invalid email format"
                });
            }
            if (!password || password.length < 6) {
                return response.status(400).json({
                    error: "Password must be at least 6 characters long"
                });
            }
            const user = await userRepository.create({
                name,
                email,
                password: await bcrypt.hash(password, 10)
            });
            // Optionally send verification email
            const verifyToken = jwt.sign(
                { email: user.email },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '1d' }
            );
            await sendVerifyEmail(email, verifyToken);
            response.status(201).json(user);
        } catch (error) {
            console.log(error);
            response.status(500).json({
                error: error.message
            });
        }
    }

    async verifyEmail(req, res) {
        try {
            const { verifyToken } = req.query;
            if (!verifyToken) {
                return res.status(400).json({
                    error: "Token de verificación requerido"
                });
            }
            const decoded = jwt.verify(verifyToken, ENVIRONMENT.JWT_SECRET);
            const { email } = decoded;
            if (!email) {
                return res.status(400).json({
                    error: "Email requerido"
                });
            }
            const user = await userRepository.getByEmail(email);
            if (!user) {
                return res.status(404).json({
                    error: "Usuario no encontrado"
                });
            }
            if (user.isVerified) {
                return res.status(400).json({
                    error: "El usuario ya está verificado"
                });
            }
            await userRepository.updateUser(
                user._id,
                {
                    isVerified: true
                }
            );
            return res.status(200).json({
                message: "Usuario verificado correctamente"
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    async login(request, response){
        try{
            const {email, password} = request.body

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400)
            }

            if (!password || password.length < 6) {
                throw new ServerError("Contraseña invalida", 400)
            }

            const user_found = await userRepository.getByEmail(email)

            if(!user_found){
                throw new ServerError("Usuario no registrado", 404)
            }

            if(!user_found.isVerified){
                throw new ServerError("Usuario con verificacion de mail pendiente", 401)
            }

            const is_same_password = await bcrypt.compare(password, user_found.password)

            if(!is_same_password){
                throw new ServerError("Credenciales invalidas", 401)
            }

            const profile_info = {
                nombre: user_found.name,
                email: user_found.email,
                id: user_found._id,
                fecha_creacion: user_found.fecha_creacion
            }

            const access_token = jwt.sign(
                profile_info,
                ENVIRONMENT.JWT_SECRET
            )

            return response.status(200).json({
                ok:true,
                status: 200,
                message: 'Usuario autentificado exitosamente',
                data: {
                    access_token
                }
            })
        }
        catch(error){
            if (error instanceof ServerError) {
                return response.status(error.status).json(
                    {
                        message: error.message,
                        ok: false,
                        status: error.status
                    }
                )
            }
            else {
                console.error('Error critico:', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

    async requestPasswordReset(request, response) {
        try {
            const { email } = request.body;

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400);
            }

            const user = await userRepository.getByEmail(email);

            if (!user) {
                return response.status(200).json({
                    ok: true,
                    status: 200,
                    message: "Si el correo existe, se enviaron instrucciones"
                });
            }

            const resetToken = jwt.sign({ email }, ENVIRONMENT.JWT_SECRET);
            const resetLink =
                `${ENVIRONMENT.FRONTEND_URL}/reset-password/${resetToken}`;

            await mailer_transport.sendMail({
                from: ENVIRONMENT.EMAIL_USER,
                to: email,
                subject: "Restablecimiento de contraseña",
                html: `
                    <h2>Recuperación de contraseña</h2>
                    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                    <p>
                        <a href="${resetLink}">
                            Restablecer contraseña
                        </a>
                    </p>
                    <p>Utiliza este enlace para restablecer tu contraseña.</p>
                    <p>Si no solicitaste este cambio, ignora este correo.</p>
                `
            });
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Instrucciones de restablecimiento de contraseña enviadas"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                console.error('Error critico:', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

    async ResetPasswordConfirm(request, response) {
        try {
            const { resetToken, newPassword } = request.body;
            if (!resetToken) {
                throw new ServerError("Token de restablecimiento requerido", 400);
            }
            if (!newPassword || newPassword.length < 8) {
                throw new ServerError("Contraseña invalida", 400);
            }
            const decoded = jwt.verify(resetToken, ENVIRONMENT.JWT_SECRET);
            const { email } = decoded;
            const user = await userRepository.getByEmail(email);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await userRepository.updateUser(user._id, { password: user.password });
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Contraseña restablecida exitosamente"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                console.error('Error critico:', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }
}



const authController = new AuthController();
export default authController;