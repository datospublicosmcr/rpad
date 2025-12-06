// Controller para integración con API de Andino (Portal de Datos Abiertos)

/**
 * Extrae el slug del dataset desde una URL del portal
 * @param {string} url - URL completa del dataset
 * @returns {string|null} - Slug del dataset o null si no es válida
 */
function extractSlugFromUrl(url) {
  if (!url) return null;
  
  // Patrones válidos:
  // https://datos.comodoro.gov.ar/dataset/nombre-del-dataset
  // http://datos.comodoro.gov.ar/dataset/nombre-del-dataset
  // datos.comodoro.gov.ar/dataset/nombre-del-dataset
  
  const patterns = [
    /datos\.comodoro\.gov\.ar\/dataset\/([a-z0-9-]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Consulta la API de Andino y devuelve los datos mapeados
 */
export const fetchFromAndino = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el parámetro url'
      });
    }

    // Extraer slug de la URL
    const slug = extractSlugFromUrl(url);
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'URL no válida. Debe ser una URL del portal datos.comodoro.gov.ar/dataset/...'
      });
    }

    // Consultar API de Andino
    const apiUrl = `https://datos.comodoro.gov.ar/api/3/action/package_show?id=${slug}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RPAD-MCR/1.1.0'
      },
      timeout: 10000 // 10 segundos de timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Dataset no encontrado en el portal de datos abiertos'
        });
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró información del dataset'
      });
    }

    const dataset = data.result;

    // Mapear campos de Andino a RPAD
    const mappedData = {
      titulo: dataset.title || '',
      descripcion: dataset.notes || '',
      area_responsable: dataset.author || '',
      url_dataset: url.trim()
    };

    res.json({
      success: true,
      data: mappedData,
      source: {
        slug: slug,
        api_url: apiUrl
      }
    });

  } catch (error) {
    console.error('Error consultando API de Andino:', error);
    
    // Errores de red/timeout
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        error: 'No se pudo conectar con el portal de datos abiertos. Verifique su conexión o intente más tarde.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al consultar el portal de datos abiertos'
    });
  }
};
