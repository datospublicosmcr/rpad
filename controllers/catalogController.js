import pool from '../config/database.js';

// Obtener todos los temas
export const getTemas = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM temas WHERE activo = TRUE ORDER BY orden ASC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo temas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los temas'
    });
  }
};

// Obtener todas las frecuencias
export const getFrecuencias = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM frecuencias WHERE activo = TRUE ORDER BY orden ASC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo frecuencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las frecuencias'
    });
  }
};

// Obtener formatos disponibles desde BD
export const getFormatos = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, habitual, extension, tipo_mime 
       FROM formatos 
       WHERE activo = 1 
       ORDER BY habitual DESC, nombre ASC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo formatos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los formatos'
    });
  }
};
