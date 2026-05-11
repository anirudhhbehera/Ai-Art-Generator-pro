import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

function Login({ open, onClose, switchToRegister }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      onClose();
      setFormData({ email: '', password: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, rgba(30, 27, 75, 0.9), rgba(15, 15, 35, 0.95))'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: 4,
          boxShadow: theme.palette.mode === 'light' 
            ? '0 20px 40px rgba(0, 0, 0, 0.15)'
            : 'none'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography 
          variant="h4" 
          className="gradient-text" 
          sx={{ 
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Welcome Back
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            textAlign: 'center',
            mt: 1
          }}
        >
          Sign in to your account
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.02)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.04)'
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                }
              }
            }}
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.02)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.04)'
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                }
              }
            }}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mb: 3, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: loading 
                ? 'rgba(168, 85, 247, 0.5)' 
                : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.4)'
              },
              '&:disabled': {
                background: 'rgba(168, 85, 247, 0.3)'
              }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Button 
            fullWidth 
            onClick={switchToRegister}
            sx={{
              py: 1.5,
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                background: 'rgba(168, 85, 247, 0.1)',
                color: '#a855f7'
              }
            }}
          >
            Don't have an account? <span style={{ color: '#a855f7', marginLeft: '4px' }}>Sign Up</span>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default Login;