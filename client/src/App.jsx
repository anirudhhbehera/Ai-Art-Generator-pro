import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import MyCollection from './pages/MyCollection';
import Admin from './pages/Admin';
import ArtDetail from './pages/ArtDetail';
import './App.css';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#a855f7' },
    secondary: { main: '#ec4899' },
    background: mode === 'dark' 
      ? { default: '#0f0f23', paper: 'rgba(30, 27, 75, 0.4)' }
      : { default: '#ffffff', paper: 'rgba(255, 255, 255, 0.9)' },
    text: mode === 'dark'
      ? { primary: '#f8fafc', secondary: '#cbd5e1' }
      : { primary: '#1a1a1a', secondary: '#64748b' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backdropFilter: 'blur(20px)',
          border: mode === 'dark' 
            ? '1px solid rgba(168, 85, 247, 0.2)'
            : '1px solid rgba(168, 85, 247, 0.1)',
          boxShadow: mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease'
          }
        }
      }
    }
  }
});

function App() {
  const [mode, setMode] = useState('dark');
  
  const theme = useMemo(() => getTheme(mode), [mode]);
  
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'dark' ? 'light' : 'dark';
      document.body.className = newMode === 'light' ? 'light-mode' : '';
      return newMode;
    });
  };



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar toggleTheme={toggleTheme} mode={mode} />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/art/:id" element={<ArtDetail />} />
                <Route path="/my-collection" element={<MyCollection />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
