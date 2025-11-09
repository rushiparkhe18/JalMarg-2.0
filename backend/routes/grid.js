const express = require('express');
const router = express.Router();
const Grid = require('../models/Grid');

// Generate a new grid
router.post('/generate', async (req, res) => {
  try {
    const { name, bounds, resolution } = req.body;

    if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) {
      return res.status(400).json({ error: 'Invalid bounds provided' });
    }

    const cells = [];
    const latStep = resolution || 0.1;
    const lonStep = resolution || 0.1;

    for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
      for (let lon = bounds.west; lon <= bounds.east; lon += lonStep) {
        cells.push({
          lat: Math.round(lat * 1000) / 1000,
          lon: Math.round(lon * 1000) / 1000,
          obstacle: false,
          cost: 1,
        });
      }
    }

    const grid = new Grid({
      name: name || `Grid_${Date.now()}`,
      bounds,
      resolution: resolution || 0.1,
      cells,
    });

    await grid.save();
    res.status(201).json({ success: true, grid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate grid', message: error.message });
  }
});

// Get all grids
router.get('/', async (req, res) => {
  try {
    const grids = await Grid.find().select('-cells');
    res.json({ success: true, grids });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grids', message: error.message });
  }
});

// Get specific grid by ID
router.get('/:id', async (req, res) => {
  try {
    const grid = await Grid.findById(req.params.id);
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }
    res.json({ success: true, grid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grid', message: error.message });
  }
});

// Update grid (e.g., add obstacles)
router.put('/:id', async (req, res) => {
  try {
    const { cells } = req.body;
    const grid = await Grid.findByIdAndUpdate(
      req.params.id,
      { cells, updatedAt: Date.now() },
      { new: true }
    );
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }
    res.json({ success: true, grid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grid', message: error.message });
  }
});

// Delete grid
router.delete('/:id', async (req, res) => {
  try {
    const grid = await Grid.findByIdAndDelete(req.params.id);
    if (!grid) {
      return res.status(404).json({ error: 'Grid not found' });
    }
    res.json({ success: true, message: 'Grid deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete grid', message: error.message });
  }
});

module.exports = router;
