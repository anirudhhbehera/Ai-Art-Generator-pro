import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUsers();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/stats`);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/users`);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await axios.patch(`${API}/api/admin/users/${userId}/ban`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to ban user');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4">Access Denied</Typography>
        <Typography>Admin privileges required</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
        Admin <span className="gradient-text">Dashboard</span>
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'rgba(26, 26, 46, 0.6)', textAlign: 'center', p: 2 }}>
            <Typography variant="h3" className="gradient-text">{stats.totalUsers}</Typography>
            <Typography>Total Users</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'rgba(26, 26, 46, 0.6)', textAlign: 'center', p: 2 }}>
            <Typography variant="h3" className="gradient-text">{stats.totalArt}</Typography>
            <Typography>Total Artworks</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'rgba(26, 26, 46, 0.6)', textAlign: 'center', p: 2 }}>
            <Typography variant="h3" className="gradient-text">{stats.totalLikes}</Typography>
            <Typography>Total Likes</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'rgba(26, 26, 46, 0.6)', textAlign: 'center', p: 2 }}>
            <Typography variant="h3" className="gradient-text">{stats.totalComments}</Typography>
            <Typography>Total Comments</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ background: 'rgba(26, 26, 46, 0.6)' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>User Management</Typography>
          <TableContainer component={Paper} sx={{ background: 'rgba(26, 26, 46, 0.8)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color={user.role === 'banned' ? 'success' : 'error'}
                        onClick={() => handleBanUser(user._id)}
                      >
                        {user.role === 'banned' ? 'Unban' : 'Ban'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Admin;