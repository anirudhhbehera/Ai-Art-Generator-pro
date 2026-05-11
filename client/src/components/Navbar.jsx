import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Avatar, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CollectionsIcon from '@mui/icons-material/Collections';
import BrushIcon from '@mui/icons-material/Brush';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FolderIcon from '@mui/icons-material/Folder';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Register from './Register';

function Navbar({ toggleTheme, mode }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    setDrawerOpen(false);
  };

  const navLinks = [
    { label: 'Create', icon: <AutoAwesomeIcon />, path: '/' },
    { label: 'Gallery', icon: <CollectionsIcon />, path: '/gallery' },
    ...(user ? [{ label: 'My Art', icon: <FolderIcon />, path: '/my-collection' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' }] : []),
  ];

  const mobileDrawer = (
    <Box sx={{ width: 270, height: '100%', background: 'linear-gradient(180deg, #0f0f23 0%, #1e1b4b 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BrushIcon sx={{ color: '#ec4899', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #ec4899)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Art Studio
          </Typography>
        </Box>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User info */}
      {user && (
        <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
          <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', fontWeight: 700, fontSize: '0.9rem' }}>
            {user.username[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{user.username}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Artist</Typography>
          </Box>
        </Box>
      )}

      {/* Nav links */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {navLinks.map((link) => (
          <ListItemButton
            key={link.label}
            onClick={() => { navigate(link.path); setDrawerOpen(false); }}
            sx={{ borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: 'rgba(168,85,247,0.15)' } }}
          >
            <ListItemIcon sx={{ color: '#a855f7', minWidth: 36 }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(168,85,247,0.15)' }} />

      {/* Bottom actions */}
      <Box sx={{ p: 2 }}>
        <Button fullWidth onClick={toggleTheme} startIcon={mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          sx={{ mb: 1, color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', borderRadius: 2, '&:hover': { bgcolor: 'rgba(168,85,247,0.1)' } }}>
          {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        {user ? (
          <Button fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}
            sx={{ color: '#ef4444', justifyContent: 'flex-start', borderRadius: 2, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
            Logout
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { setLoginOpen(true); setDrawerOpen(false); }}
              sx={{ borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7', borderRadius: 2 }}>Login</Button>
            <Button fullWidth variant="contained" onClick={() => { setRegisterOpen(true); setDrawerOpen(false); }}
              sx={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: 2 }}>Sign Up</Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(15, 15, 35, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)' }
      }}>
        <Toolbar sx={{ py: 1, px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <BrushIcon sx={{ mr: 1, color: '#ec4899', fontSize: { xs: 22, sm: 28 } }} />
            <Typography variant="h5" sx={{
              fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1rem', sm: '1.3rem' },
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              AI Art Studio
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleTheme} color="inherit" sx={{ transition: 'all 0.3s ease', '&:hover': { background: 'rgba(168,85,247,0.1)', transform: 'rotate(180deg)' } }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {navLinks.map((link) => (
                <Button key={link.label} color="inherit" component={Link} to={link.path} startIcon={link.icon}
                  sx={{ borderRadius: 2, px: 2, py: 1, fontWeight: 600, transition: 'all 0.3s ease', '&:hover': { background: 'rgba(168,85,247,0.1)', transform: 'translateY(-1px)' } }}>
                  {link.label}
                </Button>
              ))}
              {user ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1, '&:hover': { transform: 'scale(1.1)' } }}>
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #ec4899)', fontWeight: 700, border: '2px solid rgba(168,85,247,0.3)' }}>
                      {user.username[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { background: mode === 'dark' ? '#1e1b4b' : '#ffffff', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 3, mt: 1 } }}>
                    <MenuItem sx={{ py: 1.5, px: 3, '&:hover': { background: 'rgba(168,85,247,0.1)' } }}>
                      <AccountCircleIcon sx={{ mr: 2, color: '#a855f7' }} />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>{user.username}</Typography>
                        <Typography variant="caption" color="text.secondary">Profile</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3, color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={() => setLoginOpen(true)}
                    sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600, border: '1px solid rgba(168,85,247,0.3)', '&:hover': { background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.5)' } }}>
                    Login
                  </Button>
                  <Button onClick={() => setRegisterOpen(true)}
                    sx={{ borderRadius: 2, px: 3, py: 1, ml: 1, fontWeight: 600, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', '&:hover': { background: 'linear-gradient(135deg, #9333ea, #db2777)' } }}>
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile: theme toggle + hamburger */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {user && (
                <Avatar sx={{ width: 30, height: 30, background: 'linear-gradient(135deg, #a855f7, #ec4899)', fontWeight: 700, fontSize: '0.8rem' }}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              )}
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { border: 'none' } }}>
        {mobileDrawer}
      </Drawer>

      <Login open={loginOpen} onClose={() => setLoginOpen(false)} switchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} />
      <Register open={registerOpen} onClose={() => setRegisterOpen(false)} switchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />
    </>
  );
}

export default Navbar;
