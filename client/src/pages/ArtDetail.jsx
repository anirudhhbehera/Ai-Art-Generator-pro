import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, IconButton, Button, TextField, Card, Avatar, Chip, Divider, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function ArtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [art, setArt] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchArtDetail();
  }, [id]);

  const fetchArtDetail = async () => {
    try {
      const { data } = await axios.get(`${API}/api/art/${id}`);
      setArt(data);
      setComments(data.comments || []);
    } catch (error) {
      try {
        const { data: galleryData } = await axios.get(`${API}/api/art/gallery`);
        const foundArt = galleryData.find(art => art._id === id);
        if (foundArt) {
          setArt(foundArt);
          setComments(foundArt.comments || []);
        }
      } catch (galleryError) {
        console.error('Failed to fetch art details:', galleryError);
      }
    }
    setLoading(false);
  };

  const handleLike = async () => {
    try {
      await axios.patch(`${API}/api/art/${id}/like`);
      setArt(prev => ({ ...prev, likes: (prev.likes || 0) + 1, isLiked: !prev.isLiked }));
    } catch (error) {
      setArt(prev => ({ ...prev, likes: (prev.likes || 0) + 1, isLiked: !prev.isLiked }));
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    try {
      const { data } = await axios.post(`${API}/api/art/${id}/comment`, { comment: comment.trim() });
      setComments(data.comments);
      setComment('');
      setSnackbar({ open: true, message: 'Comment added successfully!', severity: 'success' });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add comment';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    try {
      const { data } = await axios.delete(`${API}/api/art/${id}/comment/${selectedComment._id}`);
      setComments(data.comments);
      setSnackbar({ open: true, message: 'Comment deleted!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete comment', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(art.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${art.title || 'artwork'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: art.title, text: art.prompt, url: window.location.href });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (!art) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6">Artwork not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, color: 'text.secondary' }}>
          Back to Gallery
        </Button>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Card className="modern-card" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  position: 'relative', borderRadius: 3, overflow: 'hidden',
                  '&::before': {
                    content: '""', position: 'absolute', inset: 0, padding: '3px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)',
                    borderRadius: 'inherit',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor', WebkitMaskComposite: 'xor'
                  }
                }}
              >
                <img src={art.imageUrl} alt={art.title} style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain', borderRadius: '9px' }} />
              </Box>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card className="modern-card" sx={{ p: { xs: 2.5, sm: 4 }, height: 'fit-content' }}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                {art.title || art.prompt?.split(' ').slice(0, 4).join(' ') + '...' || 'Untitled Artwork'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Chip
                  icon={<PersonIcon />}
                  label={art.user?.username || 'Anonymous'}
                  sx={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {art.prompt}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton onClick={handleLike} sx={{ color: art.isLiked ? '#ff1744' : '#ffffff', '&:hover': { background: 'rgba(255, 255, 255, 0.1)' } }}>
                    <FavoriteIcon sx={{ fontSize: '2rem', color: art.isLiked ? '#ff1744' : '#ffffff' }} />
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ borderColor: 'rgba(168, 85, 247, 0.5)' }}>
                    Download
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton onClick={handleShare} sx={{ border: '1px solid rgba(168, 85, 247, 0.5)', color: '#a855f7' }}>
                    <ShareIcon />
                  </IconButton>
                </motion.div>
              </Box>

              <Divider sx={{ mb: 3, borderColor: 'rgba(168, 85, 247, 0.2)' }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Comments ({comments.length})
              </Typography>

              {user && (
                <Box component="form" onSubmit={handleComment} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth placeholder="Add a comment..." value={comment}
                      onChange={(e) => setComment(e.target.value)} size="small"
                      sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.02)' } }}
                    />
                    <IconButton type="submit" disabled={!comment.trim()} sx={{ color: '#a855f7' }}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {comments.map((comment) => (
                  <Box key={comment._id} sx={{ mb: 2, p: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                          {(comment.user?.username || 'U')[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{comment.user?.username || 'Anonymous'}</Typography>
                      </Box>
                      {user && comment.user?._id === user._id && (
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{comment.text}</Typography>
                  </Box>
                ))}
                {comments.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </Box>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                </MenuItem>
              </Menu>

              <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
              </Snackbar>
            </Card>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

export default ArtDetail;
