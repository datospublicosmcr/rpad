import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

// Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ? AND activo = TRUE',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken({
      userId: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: usuario.id,
          username: usuario.username,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Verificar token
export const verifySession = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, nombre_completo, email, rol FROM usuarios WHERE id = ? AND activo = TRUE',
      [req.user?.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user: rows[0] }
    });
  } catch (error) {
    console.error('Error verificando sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Obtener usuario actual
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [req.user?.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const usuario = rows[0];

    // Verificar contraseña actual
    const passwordValid = await bcrypt.compare(currentPassword, usuario.password_hash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await pool.execute(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user?.userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil (nombre y email)
export const updateProfile = async (req, res) => {
  try {
    const { nombre_completo, email } = req.body;
    const userId = req.user?.userId;

    if (!nombre_completo && !email) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Verificar que el usuario existe
    const [userRows] = await pool.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Si se cambia el email, verificar que no esté en uso por otro usuario
    if (email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Construir query de actualización
    const updates = [];
    const values = [];

    if (nombre_completo) {
      updates.push('nombre_completo = ?');
      values.push(nombre_completo.trim());
    }

    if (email) {
      updates.push('email = ?');
      values.push(email.trim().toLowerCase());
    }

    values.push(userId);

    await pool.execute(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener datos actualizados
    const [updatedUser] = await pool.execute(
      'SELECT id, username, nombre_completo, email, rol FROM usuarios WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: { user: updatedUser[0] }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener datos del perfil actual
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const [rows] = await pool.execute(
      'SELECT id, username, nombre_completo, email, rol, created_at FROM usuarios WHERE id = ? AND activo = TRUE',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user: rows[0] }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
