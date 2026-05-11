import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, IconButton, Box, Chip, TextField, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

function Gallery() {
  const [arts, setArts] = useState([]);
  const [filteredArts, setFilteredArts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/art/gallery');
      console.log('Gallery data:', data); // Debug log
      console.log('First art item:', data[0]); // Debug first item
      setArts(data);
      setFilteredArts(data);
    } catch (error) {
      console.error('Failed to fetch gallery');
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
    return distance <= Math.ceil(maxLength * 0.3); // Allow 30% difference
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
      const author = (art.author || '').toLowerCase();
      const allText = `${title} ${prompt} ${tags.join(' ')} ${author}`;

      const titleWords = title.split(/\s+/);
      const promptWords = prompt.split(/\s+/);
      const tagWords = tags.flatMap(tag => tag.split(/\s+/));
      const authorWords = author.split(/\s+/);
      const allWords = [...titleWords, ...promptWords, ...tagWords, ...authorWords];

      // Priority 1: Exact word match in title or tags (highest priority)
      if (titleWords.includes(searchTerm) || tagWords.includes(searchTerm)) {
        score = 100;
      }
      // Priority 2: Exact word match in prompt or author
      else if (promptWords.includes(searchTerm) || authorWords.includes(searchTerm)) {
        score = 90;
      }
      // Priority 3: Substring match in title or tags (word starts with search term)
      else if (titleWords.some(word => word.startsWith(searchTerm)) || 
               tagWords.some(word => word.startsWith(searchTerm))) {
        score = 70;
      }
      // Priority 4: Contains in title, prompt, or tags
      else if (title.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm))) {
        score = 50;
      }
      else if (prompt.includes(searchTerm)) {
        score = 40;
      }

      if (score > 0) {
        results.push({ ...art, searchScore: score });
      }
    });

    // If no direct matches found, try fuzzy matching and semantic search
    if (results.length === 0 && searchTerm.length >= 3) {
      arts.forEach(art => {
        let score = 0;
        const title = (art.title || '').toLowerCase();
        const prompt = (art.prompt || '').toLowerCase();
        const tags = (art.tags || []).map(tag => tag.toLowerCase());
        const allText = `${title} ${prompt} ${tags.join(' ')}`;

        const titleWords = title.split(/\s+/);
        const promptWords = prompt.split(/\s+/);
        const tagWords = tags.flatMap(tag => tag.split(/\s+/));
        const allWords = [...titleWords, ...promptWords, ...tagWords];

        // Priority 5: Fuzzy match for misspellings
        const fuzzyMatch = allWords.find(word => isSimilarWord(searchTerm, word));
        if (fuzzyMatch) {
          if (titleWords.includes(fuzzyMatch) || tagWords.includes(fuzzyMatch)) {
            score = 35;
          } else if (promptWords.includes(fuzzyMatch)) {
            score = 30;
          }
        }
        
        // Priority 6: Semantic similarity
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

    // Sort by score (highest first)
    results.sort((a, b) => b.searchScore - a.searchScore);
    setFilteredArts(results);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchImages(query);
  };

  const handleLike = async (id) => {
    try {
      const { data } = await axios.patch(`http://localhost:5000/api/art/${id}/like`);
      const updatedArts = arts.map(art => 
        art._id === id 
          ? { ...art, likes: (art.likes || 0) + 1, isLiked: !art.isLiked }
          : art
      );
      setArts(updatedArts);
      // Update filtered results too
      setFilteredArts(filteredArts.map(art => 
        art._id === id 
          ? { ...art, likes: (art.likes || 0) + 1, isLiked: !art.isLiked }
          : art
      ));
    } catch (error) {
      // Fallback: increment locally
      const updatedArts = arts.map(art => 
        art._id === id 
          ? { ...art, likes: (art.likes || 0) + 1, isLiked: !art.isLiked }
          : art
      );
      setArts(updatedArts);
      setFilteredArts(filteredArts.map(art => 
        art._id === id 
          ? { ...art, likes: (art.likes || 0) + 1, isLiked: !art.isLiked }
          : art
      ));
    }
  };

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
            Community <span className="gradient-text floating-animation">Gallery</span>
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
            Discover breathtaking AI-generated masterpieces from our creative community
          </Typography>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TextField
              fullWidth
              placeholder="Search by title, prompt, tags, or describe what you're looking for..."
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
                onClick={() => {
                  console.log('Navigating to:', `/art/${art._id}`);
                  navigate(`/art/${art._id}`);
                }}
                sx={{
                  height: { xs: 'auto', sm: 420, md: 420 },
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 320 },
                  minWidth: { xs: 'unset', sm: 280 },
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
                    sx={{ height: { xs: 'auto', sm: 280 }, aspectRatio: { xs: '16/9', sm: 'auto' }, width: '100%', objectFit: 'cover' }}
                    image={art.imageUrl}
                    alt={art.prompt}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-end',
                      p: 2
                    }}
                    className="image-overlay"
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3, height: 160, display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
                  <Typography 
                    variant="h6" 
                    color="text.primary" 
                    sx={{ 
                      mb: 1, 
                      height: 40, 
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {art.title || 'Untitled Artwork'}
                  </Typography>
                  
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
                      icon={<PersonIcon sx={{ fontSize: 16 }} />}
                      label={art.user?.username || 'Anonymous'}
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: 'text.primary',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: '#a855f7'
                        }
                      }}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(art._id);
                          }}
                          sx={{ 
                            color: art.isLiked ? '#ff1744' : '#ffffff',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.2)',
                              background: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </motion.div>
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
              Try different keywords or browse all artworks
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
              Be the first to create something amazing!
            </Typography>
          </Box>
        </motion.div>
      )}
    </Container>
  );
}

export default Gallery;
