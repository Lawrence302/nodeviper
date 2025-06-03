import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Snake App API',
    description: 'Backend API for Snake app'
  },
  host: 'localhost:3000',
  schemes: [
    "https"
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
    },
  },
  security: [{
    bearerAuth: [],
  }],
};

const outputFile = './swagger-output.json';
const routes = ['./routes/adminRoutes.js', './routes/authRoutes.js','./routes/scoreRoutes.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);