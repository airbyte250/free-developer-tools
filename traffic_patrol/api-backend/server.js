const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3010;

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'trafficpatrol',
  password: 'TrafficP@trol2026',
  database: 'traffic_patrol',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============ OFFICERS ============

// Get all officers
app.get('/api/officers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM officers ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get officer by mobile number (for app login)
app.get('/api/officers/by-mobile/:mobile', async (req, res) => {
  try {
    const mobile = req.params.mobile.replace(/\D/g, '');
    const normalized = mobile.length > 10 ? mobile.slice(-10) : mobile;
    const [rows] = await pool.query('SELECT * FROM officers WHERE mobileNumber = ? AND isActive = 1 LIMIT 1', [normalized]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Officer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add officer
app.post('/api/officers', async (req, res) => {
  try {
    const { name, mobileNumber, badgeNumber, role, station, district, state } = req.body;
    if (!name || !mobileNumber || !badgeNumber || !role || !station) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const mobile = mobileNumber.replace(/\D/g, '');
    if (mobile.length !== 10) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    const [existing] = await pool.query('SELECT id FROM officers WHERE mobileNumber = ?', [mobile]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Mobile number already registered' });
    }

    const [result] = await pool.query(
      'INSERT INTO officers (name, mobileNumber, badgeNumber, role, station, district, state, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [name, mobile, badgeNumber, role, station, district || null, state || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Officer added successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Mobile number already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update officer
app.put('/api/officers/:id', async (req, res) => {
  try {
    const { name, mobileNumber, badgeNumber, role, station, district, state } = req.body;
    const mobile = mobileNumber ? mobileNumber.replace(/\D/g, '') : undefined;
    
    await pool.query(
      'UPDATE officers SET name=?, mobileNumber=?, badgeNumber=?, role=?, station=?, district=?, state=? WHERE id=?',
      [name, mobile, badgeNumber, role, station, district || null, state || null, req.params.id]
    );
    res.json({ message: 'Officer updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Mobile number already registered to another officer' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Toggle officer status
app.patch('/api/officers/:id/toggle', async (req, res) => {
  try {
    await pool.query('UPDATE officers SET isActive = NOT isActive WHERE id = ?', [req.params.id]);
    res.json({ message: 'Status toggled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete officer
app.delete('/api/officers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM officers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ TRAFFIC ALERTS ============

// Get all traffic alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM traffic_alerts ORDER BY createdAt DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create traffic alert
app.post('/api/alerts', async (req, res) => {
  try {
    const { description, latitude, longitude, severity, reportedBy, areaName } = req.body;
    const [result] = await pool.query(
      'INSERT INTO traffic_alerts (description, latitude, longitude, severity, reportedBy, areaName) VALUES (?, ?, ?, ?, ?, ?)',
      [description, latitude || null, longitude || null, severity || 'medium', reportedBy || null, areaName || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Alert created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update alert status
app.patch('/api/alerts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE traffic_alerts SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Alert status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SOS ALERTS ============

// Get all SOS alerts
app.get('/api/sos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sos_alerts ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create SOS alert
app.post('/api/sos', async (req, res) => {
  try {
    const { officerId, officerName, latitude, longitude } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sos_alerts (officerId, officerName, latitude, longitude) VALUES (?, ?, ?, ?)',
      [officerId || null, officerName || null, latitude || null, longitude || null]
    );
    res.status(201).json({ id: result.insertId, message: 'SOS alert created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SOS status
app.patch('/api/sos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE sos_alerts SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'SOS status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ JURISDICTIONS ============

// Get jurisdiction for officer
app.get('/api/jurisdictions/:officerId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jurisdictions WHERE officerId = ? LIMIT 1', [req.params.officerId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No jurisdiction found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save/update jurisdiction
app.post('/api/jurisdictions', async (req, res) => {
  try {
    const { officerId, areaName, polygon, centerLat, centerLng } = req.body;
    const [existing] = await pool.query('SELECT id FROM jurisdictions WHERE officerId = ?', [officerId]);
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE jurisdictions SET areaName=?, polygon=?, centerLat=?, centerLng=? WHERE officerId=?',
        [areaName, JSON.stringify(polygon), centerLat, centerLng, officerId]
      );
    } else {
      await pool.query(
        'INSERT INTO jurisdictions (officerId, areaName, polygon, centerLat, centerLng) VALUES (?, ?, ?, ?, ?)',
        [officerId, areaName, JSON.stringify(polygon), centerLat, centerLng]
      );
    }
    res.json({ message: 'Jurisdiction saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ STATS ============

app.get('/api/stats', async (req, res) => {
  try {
    const [[totalRow]] = await pool.query('SELECT COUNT(*) as total FROM officers');
    const [[activeRow]] = await pool.query('SELECT COUNT(*) as active FROM officers WHERE isActive = 1');
    const [[alertsRow]] = await pool.query('SELECT COUNT(*) as alerts FROM traffic_alerts WHERE status = "active"');
    const [[sosRow]] = await pool.query('SELECT COUNT(*) as sos FROM sos_alerts WHERE status = "active"');
    res.json({
      totalOfficers: totalRow.total,
      activeOfficers: activeRow.active,
      inactiveOfficers: totalRow.total - activeRow.active,
      activeAlerts: alertsRow.alerts,
      activeSos: sosRow.sos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Traffic Patrol API running on port ${PORT}`);
});
