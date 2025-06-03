import express from 'express'
import swaggerUi from 'swagger-ui-express'
import docSpecification from '../swagger-output.json' with {type: 'json'}

const router = express.Router()


router.use('/api-doc', swaggerUi.serve)
router.get('/api-doc', swaggerUi.setup(docSpecification))

export default router;