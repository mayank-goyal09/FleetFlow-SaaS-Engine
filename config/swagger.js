const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Logistics API',
      version: '1.0.0',
      description: 'API documentation for Logistics SaaS Backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
      {
        url: 'https://your-production-url.onrender.com',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 201: { description: 'User registered successfully' } }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Login successful' } }
        }
      },
      '/api/vehicles': {
        get: {
          summary: 'Get all vehicles',
          tags: ['Vehicles'],
          responses: { 200: { description: 'List of vehicles' } }
        }
      },
      '/api/vehicles/add': {
        post: {
          summary: 'Add a new vehicle',
          tags: ['Vehicles'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: { 201: { description: 'Vehicle added' } }
        }
      },
      '/api/vehicles/{id}/location': {
        patch: {
          summary: 'Update vehicle location',
          tags: ['Vehicles'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Location updated' } }
        }
      },
      '/api/vehicles/{id}': {
        delete: {
          summary: 'Delete a vehicle',
          tags: ['Vehicles'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Vehicle deleted' } }
        }
      },
      '/api/drivers': {
        get: {
          summary: 'Get all drivers',
          tags: ['Drivers'],
          responses: { 200: { description: 'List of drivers' } }
        },
        post: {
          summary: 'Add a new driver',
          tags: ['Drivers'],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 201: { description: 'Driver added' } }
        }
      },
      '/api/assignments/assign': {
        post: {
          summary: 'Assign driver to vehicle',
          tags: ['Assignments'],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { driverId: { type: 'string' }, vehicleId: { type: 'string' } } } } } },
          responses: { 200: { description: 'Assignment successful' } }
        }
      },
      '/api/shipments': {
        get: {
          summary: 'Get all shipments',
          tags: ['Shipments'],
          responses: { 200: { description: 'List of shipments' } }
        },
        post: {
          summary: 'Create a shipment',
          tags: ['Shipments'],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 201: { description: 'Shipment created' } }
        }
      },
      '/api/shipments/{id}': {
        get: {
          summary: 'Get shipment details',
          tags: ['Shipments'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Shipment details' } }
        },
        patch: {
          summary: 'Update shipment status',
          tags: ['Shipments'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } },
          responses: { 200: { description: 'Status updated' } }
        }
      },
      '/api/stats/fleet': {
        get: {
          summary: 'Get fleet stats',
          tags: ['Stats'],
          responses: { 200: { description: 'Fleet statistics' } }
        }
      }
    }
  },
  apis: [], // No need to read files since we defined paths directly above
};

module.exports = swaggerJsdoc(options);
