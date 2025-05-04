// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let swaggerDocument;
try {
  const swaggerPath = path.join(__dirname, 'swagger.yaml');
  
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = YAML.load(swaggerPath);
    console.log('Archivo swagger.yaml cargado correctamente');
  } else {
    console.error(`El archivo swagger.yaml no existe en: ${swaggerPath}`);
    
    const rootSwaggerPath = path.join(__dirname, 'swagger.yaml');
    if (fs.existsSync(rootSwaggerPath)) {
      swaggerDocument = YAML.load(rootSwaggerPath);
      console.log('Archivo swagger.yaml cargado desde la raíz del proyecto');
    } else {
      throw new Error('No se pudo encontrar el archivo swagger.yaml');
    }
  }
} catch (error) {
  console.error('Error al cargar el archivo swagger.yaml:', error);

  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'API de Citas Médicas - Fallback',
      version: '1.0.0',
      description: 'Error cargando la documentación original'
    },
    paths: {}
  };
}

app.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: '/swagger.json', // Usar el endpoint local en lugar de cargar directamente
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor Express ejecutándose en http://localhost:${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`Especificación Swagger JSON disponible en http://localhost:${PORT}/swagger.json`);
});