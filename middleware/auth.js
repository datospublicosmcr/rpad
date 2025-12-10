import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rpad-secret-key-cambiar-en-produccion';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Middleware para rutas protegidas
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación no proporcionado'
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }

  req.user = payload;
  next();
};

// Middleware para rutas solo de administradores
export const adminOnly = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
  next();
};
