import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SkeletonGrid } from '../components/ui/Skeleton';
import DashboardShell from '../components/layout/DashboardShell';
import { useAuth } from '../hooks';
import api from '../utils/api';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Fetch teams based on user role
  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Regular users and TeamLeads see only their teams
      // Admins can see all teams (would need different endpoint)
      const response = await fetch(`${api.baseURL}/teams/my`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      toast.error('Failed to load teams');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeam.name) {
      toast.error('Team name is required');
      return;
    }
    try {
      const response = await fetch(`${api.baseURL}/teams`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      });
      const team = await response.json();
      setTeams([...teams, team]);
      setNewTeam({ name: '', description: '' });
      setShowCreateForm(false);
      toast.success('Team created successfully');
    } catch (err) {
      toast.error('Failed to create team');
    }
  };

  const addMember = async () => {
    if (!selectedTeam || !newMemberEmail) return;
    try {
      // Find user by email first
      const userResponse = await fetch(`${api.baseURL}/users/search?q=${newMemberEmail}`, {
        credentials: 'include'
      });
      const users = await userResponse.json();
      const foundUser = users.find(u => u.email === newMemberEmail);

      if (!foundUser) {
        toast.error('User not found');
        return;
      }

      await fetch(`${api.baseURL}/teams/${selectedTeam._id}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: foundUser._id, role: 'member' })
      });

      fetchTeams();
      setSelectedTeam(null);
      setNewMemberEmail('');
      toast.success('Member added successfully');
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const removeMember = async (teamId, userId) => {
    try {
      await fetch(`${api.baseURL}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchTeams();
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <SkeletonGrid count={3} />;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Teams</h1>
            <p className="text-slate-600 dark:text-slate-400">Collaborate with your team members</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Team'}
          </Button>
        </div>

        {/* Create Team Form */}
        {showCreateForm && (
          <Card className="glass-effect p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Create New Team</h2>
            <div className="space-y-4">
              <Input
                label="Team Name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
              <textarea
                className="w-full p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                placeholder="Team description (optional)"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                rows={3}
              />
              <Button
                onClick={createTeam}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                Create Team
              </Button>
            </div>
          </Card>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team._id} className="glass-effect p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{team.name}</h3>
                {team.description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{team.description}</p>
                )}
              </div>

              {/* Members */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Members ({team.members?.length || 0})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {team.members?.map(member => (
                    <div key={member.userId?._id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      <div>
                        <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">
                          {member.userId?.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => removeMember(team._id, member.userId._id)}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Member */}
              {team.owner?._id === team.owner?._id && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <button
                    onClick={() => setSelectedTeam(selectedTeam?._id === team._id ? null : team)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold w-full p-2 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                  >
                    {selectedTeam?._id === team._id ? 'Cancel' : 'Add Member'}
                  </button>

                  {selectedTeam?._id === team._id && (
                    <div className="mt-2 space-y-2">
                      <input
                        id={`member-email-${team._id}`}
                        type="email"
                        placeholder="Member email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm"
                      />
                      <Button
                        onClick={addMember}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 w-full"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <Card className="glass-effect p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No teams yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
