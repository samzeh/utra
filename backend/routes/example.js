/**
 * Example API Routes
 * 
 * This file demonstrates how to create API routes that interact with MongoDB.
 * Replace this with your actual routes.
 */

import express from 'express';
import Example from '../models/example.js';

const router = express.Router();

// GET /api/examples - Get all examples
router.get('/', async (req, res) => {
  try {
    const examples = await Example.find();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/examples/:id - Get a single example
router.get('/:id', async (req, res) => {
  try {
    const example = await Example.findById(req.params.id);
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    res.json(example);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/examples - Create a new example
router.post('/', async (req, res) => {
  try {
    const example = new Example(req.body);
    await example.save();
    res.status(201).json(example);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/examples/:id - Update an example
router.put('/:id', async (req, res) => {
  try {
    const example = await Example.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    res.json(example);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/examples/:id - Delete an example
router.delete('/:id', async (req, res) => {
  try {
    const example = await Example.findByIdAndDelete(req.params.id);
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    res.json({ message: 'Example deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
