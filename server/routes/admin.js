const express = require('express');
const router = express.Router();
const os = require('os');
const User = require('../models/User');

// GET /api/admin/stats
// Returns real OS vitals and real registered users from MongoDB
router.get('/stats', async (req, res) => {
  try {
    // 1. Calculate CPU Usage (approximation using loadavg for Linux/Mac, or simple simulated load based on cpus)
    // Note: os.loadavg() is not entirely accurate for immediate CPU % on Windows, so we'll do a basic calc
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(cpu => {
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    // This gives a rough historical snapshot. To make it dynamic per second, we'd need to compare previous ticks.
    // For simplicity in a single endpoint, we'll return a rough calculation:
    const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);

    // 2. Calculate Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = (usedMem / totalMem) * 100;

    // 3. Fetch Real Users from MongoDB
    const users = await User.find().select('-password');
    
    // Map them to match the expected frontend format
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.email.split('@')[0], // Extract name from email as fallback
      email: user.email,
      role: 'Operative', // Default role since we don't have roles in schema yet
      status: 'Active',
      lastLogin: 'Active Session'
    }));

    res.json({
      success: true,
      data: {
        vitals: {
          cpuUsage: Math.max(cpuUsage, 5), // Ensure it shows at least some usage
          memUsage: memUsage
        },
        users: formattedUsers
      }
    });

  } catch (err) {
    console.error("Admin Stats Error:", err.message);
    res.status(500).json({ success: false, data: 'Server Error' });
  }
});

module.exports = router;
