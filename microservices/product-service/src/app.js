const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../generated/product-service-client');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const prisma = new PrismaClient();
const port = 3003;

app.use(express.json());
app.use(cors());

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Service API',
      version: '1.0.0',
      description: 'API para gerenciar produtos no Product Service',
    },
    servers: [{ url: 'http://localhost:3003' }],
  },
  apis: ['./src/app.js'], // Caminho para os endpoints documentados
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota para criar um novo produto
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       500:
 *         description: Erro ao criar produto
 */
app.post('/products', async (req, res) => {
  const { name, description, price, stock } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: { name, description, price, stock },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

// Rota para listar todos os produtos
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       500:
 *         description: Erro ao buscar produtos
 */
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Rota para atualizar um produto
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar produto
 */
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { name, description, price, stock },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

// Rota para excluir um produto
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto a ser excluído
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *       500:
 *         description: Erro ao excluir produto
 */
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
});

app.listen(port, () => {
  console.log(`Product service running on port ${port}`);
});
