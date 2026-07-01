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

// ============ OFFICER LOCATIONS ============

// Update officer location (called every 15 sec from app)
app.post('/api/locations', async (req, res) => {
  try {
    const { officerId, officerName, latitude, longitude, speed, heading } = req.body;
    if (!officerId || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [existing] = await pool.query('SELECT officerId FROM officer_locations WHERE officerId = ?', [officerId]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE officer_locations SET officerName=?, latitude=?, longitude=?, speed=?, heading=?, isOnline=1, lastUpdated=NOW() WHERE officerId=?',
        [officerName || null, latitude, longitude, speed || 0, heading || 0, officerId]
      );
    } else {
      await pool.query(
        'INSERT INTO officer_locations (officerId, officerName, latitude, longitude, speed, heading, isOnline) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [officerId, officerName || null, latitude, longitude, speed || 0, heading || 0]
      );
    }
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all online officer locations (updated in last 2 minutes)
app.get('/api/locations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM officer_locations WHERE isOnline = 1 AND lastUpdated > DATE_SUB(NOW(), INTERVAL 2 MINUTE) ORDER BY lastUpdated DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set officer offline
app.patch('/api/locations/:officerId/offline', async (req, res) => {
  try {
    await pool.query('UPDATE officer_locations SET isOnline = 0 WHERE officerId = ?', [req.params.officerId]);
    res.json({ message: 'Officer set offline' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ FCM TOKEN ============

// Save FCM token for an officer
app.post('/api/officers/:id/fcm-token', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await pool.query('UPDATE officers SET fcmToken = ? WHERE id = ?', [fcmToken, req.params.id]);
    res.json({ message: 'FCM token saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ NOTIFICATION SETTINGS ============

// Get notification settings for officer
app.get('/api/officers/:id/notification-settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT notifyEnabled, notifyDelayMinutes FROM officers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Officer not found' });
    res.json({
      enabled: rows[0].notifyEnabled === 1,
      delayMinutes: rows[0].notifyDelayMinutes || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save notification settings
app.post('/api/officers/:id/notification-settings', async (req, res) => {
  try {
    const { enabled, delayMinutes } = req.body;
    await pool.query('UPDATE officers SET notifyEnabled = ?, notifyDelayMinutes = ? WHERE id = ?',
      [enabled ? 1 : 0, delayMinutes || 0, req.params.id]);
    res.json({ message: 'Notification settings saved' });
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

// ============ TRAFFIC MONITOR (Server-side) ============

const MAPS_API_KEY = 'AIzaSyAy_bbDc2scwaxORMUiCA_MtNJFjUFpU28';
const fetch = require('node-fetch');

// Track active jams: key -> { alertId, severity, firstDetected, officerId, areaName, locationName, lat, lng }
const activeJams = new Map();
// Track notification timestamps to avoid duplicates
const notifiedJams = new Map();

async function checkTrafficForAllOfficers() {
  try {
    // Get all officers with jurisdictions
    const [jurisdictions] = await pool.query(`
      SELECT j.officerId, j.areaName, j.polygon, j.centerLat, j.centerLng, 
             o.name as officerName, o.fcmToken, o.notifyEnabled, o.notifyDelayMinutes, o.role
      FROM jurisdictions j
      JOIN officers o ON o.id = j.officerId
      WHERE o.isActive = 1
    `);

    for (const jurisdiction of jurisdictions) {
      if (jurisdiction.notifyEnabled === 0) continue;

      try {
        await checkTrafficForJurisdiction(jurisdiction);
      } catch (e) {
        console.error(`Error checking traffic for officer ${jurisdiction.officerId}:`, e.message);
      }

      // Delay between checks
      await new Promise(r => setTimeout(r, 1000));
    }

    // Clean up old jam entries (older than 30 minutes)
    const now = Date.now();
    for (const [key, time] of notifiedJams) {
      if (now - time > 30 * 60 * 1000) notifiedJams.delete(key);
    }
  } catch (err) {
    console.error('Traffic monitor error:', err.message);
  }
}

async function checkTrafficForJurisdiction(jurisdiction) {
  const { officerId, areaName, polygon, centerLat, centerLng, notifyDelayMinutes } = jurisdiction;
  
  if (!centerLat || !centerLng) return;

  // Parse polygon to get check points
  let polygonData;
  try {
    polygonData = typeof polygon === 'string' ? JSON.parse(polygon) : polygon;
  } catch { return; }

  if (!polygonData || polygonData.length < 3) return;

  // Generate check points: center + midpoints of edges
  const checkPoints = [{ lat: centerLat, lng: centerLng }];
  for (let i = 0; i < Math.min(polygonData.length, 6); i++) {
    const p1 = polygonData[i];
    const p2 = polygonData[(i + 1) % polygonData.length];
    checkPoints.push({
      lat: (p1.lat + p2.lat) / 2,
      lng: (p1.lng + p2.lng) / 2,
    });
  }

  // Track which routes still have jams this cycle
  const activeRouteKeys = new Set();

  // Check traffic on routes between consecutive check points (limit to 3 routes)
  for (let i = 0; i < Math.min(checkPoints.length - 1, 3); i++) {
    const origin = checkPoints[i];
    const dest = checkPoints[i + 1];
    const routeKey = `${officerId}_${i}`;
    
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&departure_time=now&key=${MAPS_API_KEY}`;
      
      const resp = await fetch(url);
      const data = await resp.json();
      
      if (data.status !== 'OK' || !data.routes || !data.routes.length) continue;

      const legs = data.routes[0].legs;
      if (!legs || !legs.length) continue;

      for (const leg of legs) {
        const normalDuration = leg.duration?.value || 0;
        const trafficDuration = leg.duration_in_traffic?.value || 0;
        
        if (normalDuration === 0) continue;

        const ratio = trafficDuration / normalDuration;
        
        let severity = null;
        let description = null;

        if (ratio > 2.0) {
          severity = 'critical';
          description = `बहुत भारी जाम - सामान्य से ${Math.round((ratio - 1) * 100)}% ज्यादा समय`;
        } else if (ratio > 1.5) {
          severity = 'high';
          description = `भारी ट्रैफिक - सामान्य से ${Math.round((ratio - 1) * 100)}% ज्यादा समय`;
        } else if (ratio > 1.25) {
          severity = 'medium';
          description = `मध्यम ट्रैफिक - सामान्य से ${Math.round((ratio - 1) * 100)}% ज्यादा समय`;
        }

        const jamLat = leg.start_location?.lat || origin.lat;
        const jamLng = leg.start_location?.lng || origin.lng;
        const locationName = leg.start_address ? leg.start_address.split(',')[0] : areaName;

        if (severity) {
          // JAM DETECTED - mark this route as active
          activeRouteKeys.add(routeKey);

          // Check if this is a new jam or already tracked
          if (activeJams.has(routeKey)) {
            // Already tracking this jam - update severity if changed
            const existing = activeJams.get(routeKey);
            if (existing.severity !== severity) {
              // Severity changed - update
              await pool.query('UPDATE traffic_alerts SET severity = ?, description = ? WHERE id = ?',
                [severity, description, existing.alertId]);
              activeJams.set(routeKey, { ...existing, severity });
              console.log(`Traffic severity changed: ${existing.severity} → ${severity} in ${areaName} - ${locationName}`);
            }
            continue; // Already notified, don't re-notify
          }

          // Check delay for new jams
          if (notifiedJams.has(routeKey)) {
            const lastNotified = notifiedJams.get(routeKey);
            const elapsedMinutes = (Date.now() - lastNotified) / 60000;
            if (elapsedMinutes < (notifyDelayMinutes || 0)) continue;
            if (elapsedMinutes < 5) continue; // Minimum 5 min gap after resolve
          }

          // NEW JAM - save alert and notify
          const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          const trafficPercent = Math.round((ratio - 1) * 100);
          const detailedDesc = `${description} | Detected: ${nowTime} | Traffic: ${trafficPercent}% slow`;
          const [result] = await pool.query(
            'INSERT INTO traffic_alerts (description, latitude, longitude, severity, reportedBy, areaName) VALUES (?, ?, ?, ?, ?, ?)',
            [detailedDesc, jamLat, jamLng, severity, 'Auto Detection', `${areaName} - ${locationName}`]
          );

          activeJams.set(routeKey, {
            alertId: result.insertId,
            severity,
            firstDetected: Date.now(),
            officerId, areaName, locationName,
            lat: jamLat, lng: jamLng
          });
          notifiedJams.set(routeKey, Date.now());

          console.log(`NEW Traffic alert: ${severity} in ${areaName} - ${locationName} for officer ${officerId}`);

          // Send notification
          await sendTrafficNotifications(jurisdiction, severity, description, locationName, jamLat, jamLng);

        } else {
          // TRAFFIC NORMAL on this route - check if there was an active jam that is now resolved
          if (activeJams.has(routeKey)) {
            const resolved = activeJams.get(routeKey);
            const durationMinutes = Math.round((Date.now() - resolved.firstDetected) / 60000);

            // Mark alert as resolved in database
            await pool.query('UPDATE traffic_alerts SET status = ? WHERE id = ?', ['resolved', resolved.alertId]);

            // Create a "resolved" notification with time details
            const detectedTime = new Date(resolved.firstDetected).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const clearedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const resolveDesc = `ट्रैफिक सामान्य हो गया | Jam: ${detectedTime} - ${clearedTime} (${durationMinutes} min)`;
            
            // Save resolved alert
            await pool.query(
              'INSERT INTO traffic_alerts (description, latitude, longitude, severity, reportedBy, areaName, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [resolveDesc, resolved.lat, resolved.lng, 'resolved', 'Auto Detection', `${resolved.areaName} - ${resolved.locationName}`, 'resolved']
            );

            console.log(`RESOLVED: Traffic cleared in ${resolved.areaName} - ${resolved.locationName} after ${durationMinutes} min`);

            // Send "traffic cleared" notification
            await sendTrafficClearedNotification(jurisdiction, resolved.locationName, durationMinutes);

            activeJams.delete(routeKey);
            notifiedJams.set(routeKey, Date.now());
          }
        }
      }
    } catch (e) {
      // Skip route on error
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

async function sendTrafficNotifications(jurisdiction, severity, description, locationName, lat, lng) {
  const { officerId, areaName, officerName } = jurisdiction;

  // Get officer + all senior officers who should also be notified
  const [officers] = await pool.query(`
    SELECT id, name, fcmToken, role FROM officers 
    WHERE isActive = 1 AND fcmToken IS NOT NULL AND fcmToken != ''
    AND (id = ? OR role IN ('inspector', 'dsp', 'addl_sp', 'sp', 'dig', 'ig', 'adgp', 'dgp'))
  `, [officerId]);

  // Check which senior officers have jurisdiction that overlaps
  for (const officer of officers) {
    if (!officer.fcmToken) continue;

    try {
      // Send FCM via legacy HTTP API
      const fcmPayload = {
        to: officer.fcmToken,
        notification: {
          title: `${severity === 'critical' ? 'CRITICAL' : severity === 'high' ? 'HIGH' : 'MODERATE'} Traffic Alert - ${areaName}`,
          body: `${locationName} पर ${description}`,
          sound: 'default',
          priority: severity === 'critical' ? 'high' : 'normal',
        },
        data: {
          type: 'traffic_alert',
          severity: severity,
          latitude: String(lat),
          longitude: String(lng),
          areaName: areaName,
          locationName: locationName,
        }
      };

      // Note: Legacy FCM requires server key - will work when service account is configured
      // For now, the app handles local notifications via TrafficMonitorService
      console.log(`Would send FCM to ${officer.name} (${officer.role}): ${severity} alert in ${areaName}`);
    } catch (e) {
      // Skip failed notification
    }
  }
}

async function sendTrafficClearedNotification(jurisdiction, locationName, durationMinutes) {
  const { officerId, areaName } = jurisdiction;

  // Get officer's FCM token
  const [officers] = await pool.query(`
    SELECT id, name, fcmToken, role FROM officers 
    WHERE isActive = 1 AND fcmToken IS NOT NULL AND fcmToken != ''
    AND (id = ? OR role IN ('inspector', 'dsp', 'addl_sp', 'sp', 'dig', 'ig', 'adgp', 'dgp'))
  `, [officerId]);

  for (const officer of officers) {
    if (!officer.fcmToken) continue;
    try {
      console.log(`Would send RESOLVED FCM to ${officer.name}: Traffic cleared in ${areaName} - ${locationName} after ${durationMinutes} min`);
    } catch (e) {
      // Skip failed notification
    }
  }
}

// Start traffic monitoring every 2 minutes
setInterval(checkTrafficForAllOfficers, 2 * 60 * 1000);
// Run first check after 30 seconds
setTimeout(checkTrafficForAllOfficers, 30 * 1000);
console.log('Traffic monitor started - checking every 2 minutes');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Traffic Patrol API running on port ${PORT}`);
});
