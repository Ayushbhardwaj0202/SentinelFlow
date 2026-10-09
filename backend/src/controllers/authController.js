const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, department } = req.body;
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'employee'");
    const roleId = roleResult.rows.length ? roleResult.rows[0].id : 1;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role_id, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, department
    `, [username, email, hashedPassword, full_name, roleId, department]);

    const user = result.rows[0];

    await logAudit(pool, {
      actorId: user.id,
      actorUsername: user.username,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      description: 'User registered',
      ipAddress: req.ip
    });

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: 'employee',
      email: user.email
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

    const result = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.username = $1
    `, [username]);

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (user) {
         // Optionally log failed login
         await logAudit(pool, { actorId: user.id, actorUsername: user.username, action: 'FAILED_LOGIN', entityType: 'USER', description: 'Failed login attempt', ipAddress: req.ip });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'User account is not active' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    await logAudit(pool, {
      actorId: user.id,
      actorUsername: user.username,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      description: 'User logged in',
      ipAddress: req.ip
    });

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role_name,
      email: user.email
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.full_name, u.department, u.status, u.risk_level, u.last_login, u.created_at, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
