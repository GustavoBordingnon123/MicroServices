const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../generated/order-service-client');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const prisma = new PrismaClient();
const port = 3002;

app.use(express.json());
app.use(cors());

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description: 'API para gerenciar pedidos no Order Service',
    },
    servers: [{ url: 'http://localhost:3002' }],
  },
  apis: ['./src/app.js'], // Caminho para os endpoints documentados
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota para criar um novo pedido
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um novo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               product:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               totalPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       500:
 *         description: Erro ao criar pedido
 */
app.post('/orders', async (req, res) => {
  const { userId, product, quantity, totalPrice } = req.body;

  try {
    const newOrder = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        product,
        quantity,
        totalPrice: parseFloat(totalPrice)
      },
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar pedido' });
  }
});

// Rota para listar pedidos de um usuário
/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Lista todos os pedidos de um usuário
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       500:
 *         description: Erro ao buscar pedidos
 */
app.get('/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar pedidos' });
  }
});

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
});
