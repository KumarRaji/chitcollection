const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({ include: { _count: { select: { members: true } } } });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await prisma.group.create({ data: { name, description } });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get members by group
app.get('/api/groups/:id/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { groupId: parseInt(req.params.id) },
      orderBy: { id: 'desc' }
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { id: 'desc' } });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { collections: { orderBy: { collectionDate: 'asc' } } }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', upload.single('photo'), async (req, res) => {
  try {
    const { member_number, name, father_name, phone, aadhaar, address, chit_amount, start_date, due_date, group_id } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const member = await prisma.member.create({
      data: {
        memberNumber: member_number,
        name,
        fatherName: father_name,
        phone,
        aadhaar,
        address,
        photoUrl: photo_url,
        chitAmount: parseFloat(chit_amount),
        startDate: new Date(start_date),
        dueDate: new Date(due_date),
        groupId: group_id ? parseInt(group_id) : null
      }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', async (req, res) => {
  try {
    const { member_id, collection_date, due_date, amount, status, notes } = req.body;
    const collection = await prisma.collection.create({
      data: {
        memberId: parseInt(member_id),
        collectionDate: new Date(collection_date),
        dueDate: new Date(due_date),
        amount: parseFloat(amount),
        status,
        notes
      }
    });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/collections/:memberId', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { memberId: parseInt(req.params.memberId) },
      orderBy: { collectionDate: 'asc' }
    });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
