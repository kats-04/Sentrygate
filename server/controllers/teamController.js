import { Readable } from 'stream';
import csv from 'csv-parser';
import Team from '../models/Team.js';
import User from '../models/User.js';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({ status: 'active' })
      .populate('owner', 'name email')
      .populate('members.userId', 'name email');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's teams
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user.id },
        { 'members.userId': req.user.id },
      ],
    })
      .populate('owner', 'name email')
      .populate('members.userId', 'name email');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create team
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user.id,
      members: [
        {
          userId: req.user.id,
          role: 'admin',
        },
      ],
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id },
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add member to team
export const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'member' } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const memberExists = team.members.some(m => m.userId.toString() === userId);
    if (memberExists) {
      return res.status(400).json({ message: 'User already in team' });
    }

    team.members.push({ userId, role });
    await team.save();

    await User.findByIdAndUpdate(userId, {
      $push: { teams: teamId },
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove member from team
export const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findByIdAndUpdate(
      teamId,
      { $pull: { 'members': { userId } } },
      { new: true }
    );

    await User.findByIdAndUpdate(userId, {
      $pull: { teams: teamId },
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findByIdAndUpdate(teamId, req.body, { new: true });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Archive team
export const archiveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { status: 'archived' },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update member permissions
export const updateMemberPermissions = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const member = team.members.find(m => m.userId.toString() === userId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = role;
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk import team members
export const bulkImportMembers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const results = [];
    const stream = Readable.from(req.file.buffer.toString().split('\n'));

    stream
      .pipe(csv())
      .on('data', async (data) => {
        try {
          const user = await User.findOne({ email: data.email });
          if (user && !team.members.find(m => m.userId.toString() === user._id.toString())) {
            team.members.push({
              userId: user._id,
              role: data.role || 'member',
            });
            results.push({ email: data.email, status: 'added' });
          }
        } catch (err) {
          results.push({ email: data.email, status: 'failed', error: err.message });
        }
      })
      .on('end', async () => {
        await team.save();
        res.json({ message: 'Import completed', results });
      })
      .on('error', (err) => {
        res.status(400).json({ message: `CSV parsing error: ${err.message}` });
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export team members
export const exportTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members.userId', 'name email role');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const csvContent = ['name,email,role', ...team.members.map(m => `${m.userId.name},${m.userId.email},${m.role}`)].join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="team-${teamId}-members.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
