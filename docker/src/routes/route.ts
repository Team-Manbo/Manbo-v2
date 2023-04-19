import { Router } from 'express'
import { docker } from '../endpoints/docker'
import { base } from '../endpoints/base'
import { auth } from '../middlewares/auth'
import { apiLimiter } from '../middlewares/apiLimiter'

const router = Router()

router.get('/', apiLimiter(10 * 1000, 1), base)
router.get('/api', apiLimiter(10 * 1000, 1), base)
router.get('/api/docker', auth, docker)

export default router