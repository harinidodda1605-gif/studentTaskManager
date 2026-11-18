import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import authenticate from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};
const taskRules = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title is required and must be under 120 characters.'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description must be under 2,000 characters.'),
  body('category').optional().isIn(['Assignment','Exam','Project','Personal','Reading','Other']).withMessage('Choose a valid category.'),
  body('priority').optional().isIn(['Low','Medium','High']).withMessage('Choose a valid priority.'),
  body('status').optional().isIn(['Pending','In Progress','Completed']).withMessage('Choose a valid status.'),
  body('dueDate').isISO8601().withMessage('Choose a valid due date.'),
  body('course').optional().isLength({ max: 80 }).withMessage('Course must be under 80 characters.')
];

router.get('/', async (req, res, next) => {
  try {
    const { status, priority, category, search, sort = 'dueDate', order = 'asc' } = req.query;
    const filter = { user: req.user.id };
    if (['Pending','In Progress','Completed'].includes(status)) filter.status = status;
    if (['Low','Medium','High'].includes(priority)) filter.priority = priority;
    if (['Assignment','Exam','Project','Personal','Reading','Other'].includes(category)) filter.category = category;
    if (search?.trim()) filter.$or = [ { title: { $regex: search.trim(), $options: 'i' } }, { course: { $regex: search.trim(), $options: 'i' } } ];
    const sortKey = ['dueDate','createdAt','priority','title'].includes(sort) ? sort : 'dueDate';
    const tasks = await Task.find(filter).sort({ [sortKey]: order === 'desc' ? -1 : 1, createdAt: -1 }).lean();
    res.json({ tasks });
  } catch (err) { next(err); }
});

router.post('/', taskRules, validate, async (req, res, next) => {
  try { const task = await Task.create({ ...req.body, user: req.user.id }); res.status(201).json({ task }); }
  catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id.' });
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task });
  } catch (err) { next(err); }
});

router.put('/:id', taskRules, validate, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id.' });
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task });
  } catch (err) { next(err); }
});

router.patch('/:id/status', [body('status').isIn(['Pending','In Progress','Completed']).withMessage('Choose a valid status.'), validate], async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id.' });
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { status: req.body.status }, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) { next(err); }
});
export default router;
