import cron from 'node-cron';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import { sendTaskMotivationEmail } from '../utils/emailService.js';

// Configurable interval: default daily at 9am
const EMAIL_USER = process.env.EMAIL_USER || '0 9 * * *';

export function startTaskEmailScheduler() {
  cron.schedule(EMAIL_USER, async () => {
    try {
      const users = await User.find({ notificationEnabled: true });
      for (const user of users) {
        // Find tasks assigned or approaching deadline (e.g., status 'pending')
        const tasks = await Roadmap.find({ userId: user._id, status: 'pending' });
        for (const task of tasks) {
          await sendTaskMotivationEmail({ to: user.email, task, from: process.env.EMAIL_USER });
          console.log('Motivational email sent:', {
            to: user.email,
            task: {
              title: task.title,
              description: task.description,
              estimatedTime: task.estimatedTime,
              status: task.status,
              assignedAt: task.assignedAt
            }
          });
        }
      }
    } catch (err) {
      console.error('Scheduled email error:', err);
    }
  });
}
