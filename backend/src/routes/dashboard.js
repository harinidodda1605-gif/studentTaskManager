import { Router } from 'express';
import Task from '../models/Task.js';
import authenticate from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/stats', async (req, res, next) => {
  try {
    const all = await Task.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const total = all.length;
    const completed = all.filter(t => t.status === 'Completed').length;
    const pending = all.filter(t => t.status === 'Pending').length;
    const inProgress = all.filter(t => t.status === 'In Progress').length;
    const overdue = all.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < start).length;
    const dueToday = all.filter(t => t.status !== 'Completed' && new Date(t.dueDate) >= start && new Date(t.dueDate) < end).length;
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start); date.setDate(date.getDate() - 6 + i);
      const dayEnd = new Date(date); dayEnd.setDate(dayEnd.getDate() + 1);
      return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), date: date.toISOString().slice(0,10), completed: all.filter(t => t.status === 'Completed' && t.updatedAt >= date && t.updatedAt < dayEnd).length };
    });
    const priorities = ['High','Medium','Low'].map(name => ({ name, value: all.filter(t => t.priority === name && t.status !== 'Completed').length }));
    res.json({ stats: { total, completed, pending, inProgress, overdue, dueToday, completionRate: total ? Math.round(completed / total * 100) : 0 }, weekly, priorities, recent: all.slice(0, 5), upcoming: all.filter(t => t.status !== 'Completed' && new Date(t.dueDate) >= start).sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).slice(0,5) });
  } catch (err) { next(err); }
});
export default router;
