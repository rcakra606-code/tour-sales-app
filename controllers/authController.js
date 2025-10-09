const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function generateToken(userId){ return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); }

async function login(req,res){
  try{
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error:'username & password' });
    const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (!r.rows.length) return res.status(401).json({ error:'Invalid credentials' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error:'Invalid credentials' });
    const token = generateToken(user.id);
    delete user.password;
    res.json({ token, user });
  }catch(e){ console.error(e); res.status(500).json({ error:'Internal error' }); }
}

async function register(req,res){
  try{
    const { username,password,name,email,role='basic' } = req.body;
    if (!username||!password||!name||!email) return res.status(400).json({ error:'Missing fields' });
    const exists = await pool.query('SELECT id FROM users WHERE username=$1 OR email=$2',[username,email]);
    if (exists.rows.length) return res.status(409).json({ error:'Exists' });
    const hashed = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users (username,password,name,email,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,username,name,email,role', [username,hashed,name,email,role]);
    const user = r.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ token, user });
  }catch(e){ console.error(e); res.status(500).json({ error:'Internal error' }); }
}

module.exports = { login, register };