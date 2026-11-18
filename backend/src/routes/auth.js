import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticate from '../middleware/auth.js';

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};
const tokenFor = user => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'), validate
], async (req, res, next) => {
  try {
    if (await User.exists({ email: req.body.email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: req.body.name, email: req.body.email, password: await bcrypt.hash(req.body.password, 12) });
    res.status(201).json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.post('/login', [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password.'), validate
], async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
export default router;
