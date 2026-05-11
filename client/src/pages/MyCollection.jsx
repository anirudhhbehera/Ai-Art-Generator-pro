import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Box, Chip, Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemixIcon from '@mui/icons-material/AutoFixHigh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

function MyCollection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [arts, setArts] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArt, setSelectedArt] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) fetchMyCollection();
  }, [user]);

  const fetchMyCollection = async () => {
    try {
      const { data } = await axios.get('${import.meta.env.VITE_API_URL}/api/art/my-collection');
      setArts(data);
      setFilteredArts(data);
    } catch (error) {
      console.error('Failed to fetch collection');
    }
  };

  const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[len1][len2];
  };

  const isSimilarWord = (word1, word2) => {
    if (word1.length < 3 || word2.length < 3) return false;
    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    return distance <= Math.ceil(maxLength * 0.3);
  };

  const semanticKeywords = {
    animal: ['cat', 'dog', 'pet', 'wildlife', 'creature', 'beast', 'mammal', 'bird', 'fish'],
    nature: ['forest', 'tree', 'flower', 'mountain', 'ocean', 'landscape', 'garden', 'plant'],
    technology: ['robot', 'ai', 'computer', 'digital', 'cyber', 'tech', 'machine', 'laptop'],
    art: ['painting', 'drawing', 'sketch', 'artwork', 'creative', 'artistic', 'illustration'],
    fantasy: ['dragon', 'magic', 'mystical', 'fairy', 'wizard', 'enchanted', 'mythical'],
    space: ['galaxy', 'star', 'planet', 'cosmic', 'universe', 'astronaut', 'nebula'],
    game: ['gaming', 'gamer', 'videogame', 'console', 'controller', 'esports', 'gameplay']
  };

  const searchImages = (query) => {
    if (!query.trim()) {
      setFilteredArts(arts);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = [];

    arts.forEach(art => {
      let score = 0;
      const title = (art.title || '').toLowerCase();
      const prompt = (art.prompt || '').toLowerCase();
      const tags = (art.tags || []).map(tag => tag.toLowerCase());
      const style = (art.style || '').toLowerCase();
      const allText = `${title} ${prompt} ${tags.join(' ')} ${style}`;

      const titleWords = title.split(/\s+/);
      const promptWords = prompt.split(/\s+/);
      const tagWords = tags.flatMap(tag => tag.split(/\s+/));
      const styleWords = style.split(/\s+/);
      const allWords = [...titleWords, ...promptWords, ...tagWords, ...styleWords];

      // Priority 1: Exact word match in title or tags
      if (titleWords.includes(searchTerm) || tagWords.includes(searchTerm)) {
        score = 100;
      }
      // Priority 2: Exact word match in prompt or style
      else if (promptWords.includes(searchTerm) || styleWords.includes(searchTerm)) {
        score = 90;
      }
      // Priority 3: Word starts with search term
      else if (titleWords.some(word => word.startsWith(searchTerm)) || 
               tagWords.some(word => word.startsWith(searchTerm))) {
        score = 70;
      }
      // Priority 4: Contains in title or tags
      else if (title.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm))) {
        score = 50;
      }
      else if (prompt.includes(searchTerm) || style.includes(searchTerm)) {
        score = 40;
      }

      if (score > 0) {
        results.push({ ...art, searchScore: score });
      }
    });

    // If no direct matches, try fuzzy matching and semantic search
    if (results.length === 0 && searchTerm.length >= 3) {
      arts.forEach(art => {
        let score = 0;
        const title = (art.title || '').toLowerCase();
        const prompt = (art.prompt || '').toLowerCase();
        const tags = (art.tags || []).map(tag => tag.toLowerCase());
        const style = (art.style || '').toLowerCase();
        const allText = `${title} ${prompt} ${tags.join(' ')} ${style}`;

        const titleWords = title.split(/\s+/);
        const promptWords = prompt.split(/\s+/);
        const tagWords = tags.flatMap(tag => tag.split(/\s+/));
        const styleWords = style.split(/\s+/);
        const allWords = [...titleWords, ...promptWords, ...tagWords, ...styleWords];

        // Fuzzy match for misspellings
        const fuzzyMatch = allWords.find(word => isSimilarWord(searchTerm, word));
        if (fuzzyMatch) {
          if (titleWords.includes(fuzzyMatch) || tagWords.includes(fuzzyMatch)) {
            score = 35;
          } else if (promptWords.includes(fuzzyMatch) || styleWords.includes(fuzzyMatch)) {
            score = 30;
          }
        }
        
        // Semantic similarity
        if (score === 0) {
          for (const [category, keywords] of Object.entries(semanticKeywords)) {
            if (category === searchTerm) {
              if (keywords.some(keyword => allText.includes(keyword))) {
                score = 20;
                break;
              }
            }
            else if (keywords.includes(searchTerm)) {
              if (allText.includes(category) || keywords.some(kw => kw !== searchTerm && allText.includes(kw))) {
                score = 20;
                break;
              }
            }
          }
        }

        if (score > 0) {
          results.push({ ...art, searchScore: score });
        }
      });
    }

    // Sort by score
    results.sort((a, b) => b.searchScore - a.searchScore);
    setFilteredArts(results);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchImages(query);
  };

  const handleTogglePublish = async (art, e) => {
    e.stopPropagation();
    try {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/api/art/${art._id}/toggle-publish`);
      const updated = arts.map(a => a._id === art._id ? { ...a, isPublic: data.isPublic } : a);
      setArts(updated);
      setFilteredArts(prev => prev.map(a => a._id === art._id ? { ...a, isPublic: data.isPublic } : a));
      setSnackbar({ open: true, message: data.isPublic ? 'Published to Gallery!' : 'Unpublished from Gallery!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
    }
  };

  const handleMenuOpen = (event, art) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedArt(art);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditTitle = () => {
    if (selectedArt) {
      setEditTitle(selectedArt.title || '');
      setEditDialog(true);
    }
    handleMenuClose();
  };

  const handleRemix = () => {
    if (selectedArt) {
      navigate('/home', { state: { remixData: { prompt: selectedArt.prompt, style: selectedArt.style } } });
      setSelectedArt(null);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedArt) {
      setDeleteDialog(true);
    }
    handleMenuClose();
  };

  const saveTitle = async () => {
    if (!selectedArt || !editTitle.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid title', severity: 'warning' });
      return;
    }
    
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/art/${selectedArt._id}/title`, { title: editTitle.trim() });
      const updatedArts = arts.map(art => art._id === selectedArt._id ? { ...art, title: editTitle.trim() } : art);
      setArts(updatedArts);
      const updatedFilteredArts = filteredArts.map(art => art._id === selectedArt._id ? { ...art, title: editTitle.trim() } : art);
      setFilteredArts(updatedFilteredArts);
      setSnackbar({ open: true, message: 'Title updated successfully!', severity: 'success' });
      setEditDialog(false);
      setSelectedArt(null);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to update title', severity: 'error' });
    }
  };

  const deleteArt = async () => {
    if (!selectedArt) {
      setSnackbar({ open: true, message: 'No artwork selected', severity: 'warning' });
      return;
    }
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/art/${selectedArt._id}`);
      const updatedArts = arts.filter(art => art._id !== selectedArt._id);
      setArts(updatedArts);
      setFilteredArts(updatedArts.filter(art => {
        if (!searchQuery.trim()) return true;
        const searchTerm = searchQuery.toLowerCase();
        const title = (art.title || '').toLowerCase();
        const prompt = (art.prompt || '').toLowerCase();
        return title.includes(searchTerm) || prompt.includes(searchTerm);
      }));
      setSnackbar({ open: true, message: 'Art deleted successfully!', severity: 'success' });
      setDeleteDialog(false);
      setSelectedArt(null);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to delete art', severity: 'error' });
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4">Please login to view your collection</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 }, width: '100%', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              mb: 3, 
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.8rem', md: '4rem' },
              lineHeight: 1.1
            }}
          >
            My <span className="gradient-text floating-animation">Collection</span>
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Your personal AI art gallery
          </Typography>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TextField
              fullWidth
              placeholder="Search your artworks by title, prompt, tags, or style..."
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                maxWidth: 600,
                mx: 'auto',
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '25px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.08)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                )
              }}
            />
          </motion.div>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {filteredArts.map((art, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={art._id}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ y: -12, scale: 1.02 }}
            >
              <Card
                className="modern-card"
                onClick={() => navigate(`/art/${art._id}`)}
                sx={{
                  height: 460,
                  width: '100%',
                  maxWidth: 320,
                  minWidth: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #a855f7, #ec4899, #f59e0b)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="280"
                    image={art.imageUrl}
                    alt={art.prompt}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  />
                  {/* Direct delete button on image */}
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setSelectedArt(art); setDeleteDialog(true); }}
                    sx={{
                      position: 'absolute', top: 8, right: 8,
                      bgcolor: 'rgba(239,68,68,0.85)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(220,38,38,1)', transform: 'scale(1.1)' },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  {/* Published badge */}
                  {art.isPublic && (
                    <Chip
                      icon={<PublicIcon sx={{ fontSize: '14px !important' }} />}
                      label="Published"
                      size="small"
                      onClick={(e) => handleTogglePublish(art, e)}
                      sx={{
                        position: 'absolute', top: 8, left: 8,
                        bgcolor: 'rgba(16,185,129,0.85)',
                        color: 'white', fontWeight: 600, fontSize: '0.7rem',
                        cursor: 'pointer',
                        '& .MuiChip-icon': { color: 'white' },
                        '&:hover': { bgcolor: 'rgba(5,150,105,1)' }
                      }}
                    />
                  )}
                  {!art.isPublic && (
                    <Chip
                      icon={<PublicOffIcon sx={{ fontSize: '14px !important' }} />}
                      label="Private"
                      size="small"
                      onClick={(e) => handleTogglePublish(art, e)}
                      sx={{
                        position: 'absolute', top: 8, left: 8,
                        bgcolor: 'rgba(100,100,100,0.75)',
                        color: 'white', fontWeight: 600, fontSize: '0.7rem',
                        cursor: 'pointer',
                        '& .MuiChip-icon': { color: 'white' },
                        '&:hover': { bgcolor: 'rgba(168,85,247,0.85)' }
                      }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3, height: 180, display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      color="text.primary" 
                      sx={{ 
                        flex: 1,
                        height: 32,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                        textOverflow: 'ellipsis',
                        mr: 1
                      }}
                    >
                      {art.title || 'Untitled Artwork'}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, art)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      height: 40, 
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {art.prompt}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Chip
                      label={art.style}
                      size="small"
                      sx={{ 
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteIcon sx={{ color: '#ec4899', fontSize: 18 }} />
                      <Typography variant="body2">{art.likes?.length || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {filteredArts.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h4" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                fontWeight: 600
              }}
            >
              No results found
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ opacity: 0.7 }}
            >
              Try different keywords or browse all your artworks
            </Typography>
          </Box>
        </motion.div>
      )}

      {arts.length === 0 && !searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mt: 12 }}>
            <Typography 
              variant="h4" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                fontWeight: 600
              }}
            >
              No artwork yet
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ opacity: 0.7 }}
            >
              Start creating something amazing!
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Edit Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark' ? '#1e1b4b' : '#ffffff',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none'
          }
        }}
      >
        <MenuItem onClick={handleEditTitle}>
          <EditIcon sx={{ mr: 1 }} /> Edit Title
        </MenuItem>
        <MenuItem onClick={handleRemix}>
          <RemixIcon sx={{ mr: 1 }} /> Remix
        </MenuItem>
        <MenuItem onClick={async () => { if (selectedArt) await handleTogglePublish(selectedArt, { stopPropagation: () => {} }); handleMenuClose(); }}>
          {selectedArt?.isPublic ? <PublicOffIcon sx={{ mr: 1 }} /> : <PublicIcon sx={{ mr: 1 }} />}
          {selectedArt?.isPublic ? 'Unpublish' : 'Publish to Gallery'}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Edit Title Dialog */}
      <Dialog open={editDialog} onClose={() => { setEditDialog(false); setSelectedArt(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Title</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialog(false); setSelectedArt(null); }}>Cancel</Button>
          <Button onClick={saveTitle} variant="contained" disabled={!editTitle.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => { setDeleteDialog(false); setSelectedArt(null); }}>
        <DialogTitle>Delete Artwork</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this artwork? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialog(false); setSelectedArt(null); }}>Cancel</Button>
          <Button onClick={deleteArt} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default MyCollection;
