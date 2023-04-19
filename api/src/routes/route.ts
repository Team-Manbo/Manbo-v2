import { Router } from 'express'
import { docs } from '../endpoints/docs'
import { base } from '../endpoints/base'
import { info } from '../endpoints/info'
import { oauth } from '../endpoints/oauth'
import { auth } from '../middlewares/auth'
import { apiLimiter } from '../middlewares/apiLimiter'

const router = Router()

router.get('/', apiLimiter(10 * 1000, 1), base)
router.get('/api', apiLimiter(10 * 1000, 1), base)
router.get('/docs', apiLimiter(10 * 1000, 1), docs)
router.get('/api/info', auth, info)
router.post('/api/oauth/callback', auth, oauth)

export default router