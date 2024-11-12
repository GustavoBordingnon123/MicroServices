const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
require('dotenv').config();

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já registrado' });
    }

    // Criptografar senha e criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};
