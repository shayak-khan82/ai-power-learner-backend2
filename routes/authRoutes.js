import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js'
import protect from '../middleware/auth.js';

const routes = express.Router();

const registerValidation = [
    body('username')
    .trim()
    .isLength({min: 3})
    .withMessage('Username must be at least 3 characters'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters')
];


const loginValidation = [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .notEmpty()
    .withMessage('Password is required')
];
//public routes
routes.post('/register',registerValidation,register)
routes.post('/login', loginValidation,login);

//Protected routes
routes.get('/profile', protect, getProfile);
routes.put('/profile', protect,updateProfile);
routes.post('/change-password',protect,changePassword)

export default routes;