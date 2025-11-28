import cron from 'node-cron';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import { sendTaskMotivationEmail } from '../utils/emailService.js';

// Configurable interval: default daily at 9am
const CRON_SCHEDULE = process.env.TASK_EMAIL_CRON || '0 9 * * *';

export function startTaskEmailScheduler() {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const users = await User.find({ notificationEnabled: true });
      for (const user of users) {
        // Find tasks assigned or approaching deadline (e.g., status 'pending')
        const tasks = await Roadmap.find({ userId: user._id, status: 'pending' });
        for (const task of tasks) {
          await sendTaskMotivationEmail({ to: user.email, task, from: process.env.EMAIL_USER });
        }
      }
    } catch (err) {
      // Silent error
    }
  });
}
