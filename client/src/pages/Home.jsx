import { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Card, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import PublicIcon from '@mui/icons-material/Public';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const styles = {
  'default': 'Default',
  'van-gogh': 'Van Gogh Style',
  'watercolor': 'Watercolor',
  'cyberpunk': 'Cyberpunk',
  'anime': 'Anime Style',
  'realistic': 'Photorealistic',
  'oil-painting': 'Oil Painting',
  'digital-art': 'Digital Art',
  'pixel-art': 'Pixel Art',
  'abstract': 'Abstract Art',
  'impressionist': 'Impressionist',
  'pop-art': 'Pop Art',
  'minimalist': 'Minimalist',
  'surreal': 'Surrealism',
  'comic-book': 'Comic Book Style',
  'sketch': 'Pencil Sketch'
};

function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('default');
  const [tags, setTags] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (location.state?.remixData) {
      const { prompt: remixPrompt, style: remixStyle } = location.state.remixData;
      setPrompt(remixPrompt);
      setStyle(remixStyle);
      setTitle('Remix - ' + remixPrompt.split(' ').slice(0, 3).join(' '));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!title.trim() || !prompt.trim() || !user) {
      setSnackbar({ open: true, message: 'Please login and fill all fields to generate art', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/art/generate`, { title, prompt, style });
      setGeneratedImage(data.imageUrl);
      setSnackbar({ open: true, message: 'Art generated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate art', severity: 'error' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!generatedImage || !user) return;
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.post(`${API}/api/art/save`, { title, prompt, imageUrl: generatedImage, style, tags: tagArray });
      setSnackbar({ open: true, message: 'Saved to My Art!', severity: 'success' });
      setTitle(''); setPrompt(''); setTags(''); setGeneratedImage(''); setStyle('default');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save', severity: 'error' });
    }
  };

  const handlePublish = async () => {
    if (!generatedImage || !user) return;
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.post(`${API}/api/art/publish`, { title, prompt, imageUrl: generatedImage, style, tags: tagArray });
      setSnackbar({ open: true, message: 'Published to Gallery & saved to My Art!', severity: 'success' });
      setTitle(''); setPrompt(''); setTags(''); setGeneratedImage(''); setStyle('default');
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to publish', severity: 'error' });
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'ai-artwork'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Image downloaded!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Download failed', severity: 'error' });
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 }, width: '100%', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Typography variant="h1" sx={{ mb: 3, fontWeight: 800, fontSize: { xs: '2rem', sm: '2.8rem', md: '4rem' }, lineHeight: 1.1 }}>
              Create <span className="gradient-text floating-animation">AI Art</span>
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 400, maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Transform your imagination into stunning visuals with the power of AI
            </Typography>
          </motion.div>
        </Box>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="modern-card" sx={{ p: { xs: 2.5, sm: 4, md: 5 }, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth label="Artwork Title" placeholder="e.g., Mystical Forest Dreams"
                value={title} onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.02)', '&:hover': { background: 'rgba(255, 255, 255, 0.04)' }, '&.Mui-focused': { background: 'rgba(255, 255, 255, 0.06)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' } } }}
              />
              <TextField
                fullWidth multiline rows={4} label="Describe your vision"
                placeholder="e.g., A mystical forest with glowing mushrooms and ethereal light rays..."
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.02)', '&:hover': { background: 'rgba(255, 255, 255, 0.04)' }, '&.Mui-focused': { background: 'rgba(255, 255, 255, 0.06)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' } } }}
              />
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 4, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                  <InputLabel>Art Style</InputLabel>
                  <Select value={style} onChange={(e) => setStyle(e.target.value)} label="Art Style"
                    sx={{ background: 'rgba(255, 255, 255, 0.02)' }}
                    MenuProps={{ PaperProps: { sx: { background: theme.palette.mode === 'dark' ? '#1e1b4b' : '#ffffff', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: 2 } } }}
                  >
                    {Object.entries(styles).map(([key, label]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth label="Tags (comma separated)" placeholder="nature, fantasy, colorful, dreamy"
                  value={tags} onChange={(e) => setTags(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.02)' } }}
                />
              </Box>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth variant="contained" size="large" onClick={handleGenerate}
                  disabled={loading || !title.trim() || !prompt.trim()}
                  startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <AutoAwesomeIcon />}
                  className={loading ? '' : 'pulse-glow'}
                  sx={{
                    background: loading ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)',
                    py: 2, fontSize: '1.2rem', fontWeight: 700,
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }
                  }}
                >
                  {loading ? 'Creating Magic...' : 'Generate Masterpiece'}
                </Button>
              </motion.div>
            </Box>
          </Card>
        </motion.div>

        {(generatedImage || loading) && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Card className="modern-card" sx={{ mt: 6, p: { xs: 2, sm: 4 }, maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} whileHover={{ scale: generatedImage && !loading ? 1.05 : 1 }}>
                  <Box sx={{
                    position: 'relative', display: 'inline-block', borderRadius: '20px', overflow: 'hidden', mb: 3,
                    width: { xs: '260px', sm: '320px' }, height: { xs: '260px', sm: '320px' },
                    '&::before': { content: '""', position: 'absolute', inset: 0, padding: '3px', background: 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)', borderRadius: 'inherit', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor' }
                  }}>
                    {loading ? (
                      <Box sx={{ width: '320px', height: '320px', background: 'rgba(15, 15, 35, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '17px' }}>
                        <Box sx={{ width: 60, height: 60, border: '4px solid rgba(168, 85, 247, 0.3)', borderTop: '4px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite', mb: 2, '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                        <Typography variant="h6" sx={{ color: '#a855f7', fontWeight: 600 }}>Wait for the Magic ✨</Typography>
                      </Box>
                    ) : (
                      <img src={generatedImage} alt="Generated art" loading="eager" style={{ width: '320px', height: '320px', objectFit: 'cover', borderRadius: '17px', display: 'block' }} />
                    )}
                  </Box>
                </motion.div>

                {!loading && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}
                        sx={{ px: 3, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', '&:hover': { background: 'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)', transform: 'translateY(-2px)' } }}>
                        Save to My Art
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="contained" startIcon={<PublicIcon />} onClick={handlePublish}
                        sx={{ px: 3, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)', '&:hover': { background: 'linear-gradient(135deg, #db2777 0%, #d97706 100%)', transform: 'translateY(-2px)' } }}>
                        Publish to Gallery
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}
                        sx={{ px: 3, py: 1.5, fontSize: '1rem', borderColor: '#a855f7', color: '#a855f7', '&:hover': { borderColor: '#9333ea', background: 'rgba(168, 85, 247, 0.1)', transform: 'translateY(-2px)' } }}>
                        Download
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleGenerate} disabled={loading}
                        sx={{ px: 3, py: 1.5, fontSize: '1rem', borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', background: 'rgba(16, 185, 129, 0.1)', transform: 'translateY(-2px)' }, '&:disabled': { borderColor: 'rgba(16, 185, 129, 0.3)', color: 'rgba(16, 185, 129, 0.3)' } }}>
                        Regenerate
                      </Button>
                    </motion.div>
                  </Box>
                )}
              </Box>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, backdropFilter: 'blur(10px)', background: snackbar.severity === 'success' ? 'rgba(34, 197, 94, 0.9)' : snackbar.severity === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(251, 191, 36, 0.9)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Home;
