import express from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settings.controller.js';
import auth from '../middelware/auth.middleware.js';

const router = express.Router();

// Get user settings
router.get('/', auth, getSettings);

// Update user settings
router.put('/', auth, updateSettings);

// Reset settings to default
router.post('/reset', auth, resetSettings);

export default router;