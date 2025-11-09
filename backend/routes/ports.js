const express = require('express');
const router = express.Router();
const {
  INDIAN_OCEAN_PORTS,
  getPortsByCountry,
  getPortsByRegion,
  searchPorts,
  getAllCountries,
  getAllRegions,
} = require('../indianOceanPorts');

// Get all ports (already filtered in indianOceanPorts.json)
router.get('/', (req, res) => {
  try {
    // Ports are pre-filtered in indianOceanPorts.json:
    // - 330 ports remaining (down from 667)
    // - Removed 46 ports outside grid bounds
    // - Removed 291 East Asian ports (lon > 105°E)
    res.json({
      success: true,
      total: INDIAN_OCEAN_PORTS.length,
      ports: INDIAN_OCEAN_PORTS,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ports', message: error.message });
  }
});

// Get all countries
router.get('/countries', (req, res) => {
  try {
    res.json({
      success: true,
      countries: getAllCountries(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries', message: error.message });
  }
});

// Get all regions
router.get('/regions', (req, res) => {
  try {
    res.json({
      success: true,
      regions: getAllRegions(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regions', message: error.message });
  }
});

// Get ports by country
router.get('/country/:country', (req, res) => {
  try {
    const ports = getPortsByCountry(req.params.country);
    res.json({
      success: true,
      country: req.params.country,
      total: ports.length,
      ports,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ports', message: error.message });
  }
});

// Get ports by region
router.get('/region/:region', (req, res) => {
  try {
    const ports = getPortsByRegion(req.params.region);
    res.json({
      success: true,
      region: req.params.region,
      total: ports.length,
      ports,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ports', message: error.message });
  }
});

// Search ports
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const ports = searchPorts(q);
    res.json({
      success: true,
      query: q,
      total: ports.length,
      ports,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search ports', message: error.message });
  }
});

module.exports = router;
