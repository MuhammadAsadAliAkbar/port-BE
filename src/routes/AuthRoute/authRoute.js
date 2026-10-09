import express from "express"
import { register, logout, signin } from '../../controllers/AuthController/authController.js'

const router = express.Router()

router.post('/register', register)
router.post('/signin', signin)
router.post('/logout', logout)

export default router
