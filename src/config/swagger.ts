import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cosmic Payment API',
      version: '1.0.0',
      description: 'Cross-border payment gateway for Africa',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/paymentProviders/phone-network-detector.ts',
  ],
};

export function setupSwagger(app: Application): void {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
}
