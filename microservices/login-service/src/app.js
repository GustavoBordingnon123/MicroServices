const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../generated/login-service-client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3001;
const prisma = new PrismaClient();
const jwtSecret = 'your_jwt_secret';

app.use(express.json());
app.use(cors());

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Login Service API',
      version: '1.0.0',
      description: 'API para gerenciar autenticação de usuários no Login Service',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/app.js'], // Caminho para os endpoints documentados
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota de registro de usuário
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       500:
 *         description: Erro ao registrar usuário
 */
app.post('/auth/register', async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        email
      }
    });
    res.status(201).json({ message: 'Usuário registrado com sucesso', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Rota de login de usuário
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro ao realizar login
 */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login bem-sucedido', token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

// Rota protegida de exemplo
/**
 * @swagger
 * /auth/protected:
 *   get:
 *     summary: Acesso a uma rota protegida
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           description: Bearer token de autenticação
 *     responses:
 *       200:
 *         description: Acesso autorizado
 *       401:
 *         description: Token inválido ou expirado
 */
app.get('/auth/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.json({ message: 'Acesso autorizado', userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
});

app.listen(port, () => {
  console.log(`Login service running on port ${port}`);
});
