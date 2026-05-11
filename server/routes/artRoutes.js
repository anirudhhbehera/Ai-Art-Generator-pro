const express = require('express');
const router = express.Router();
const Art = require('../models/Art');
const { auth, adminAuth } = require('../middleware/auth');
const axios = require('axios');

const styles = {
  'van-gogh': 'in the style of Van Gogh, swirling brushstrokes, impasto texture, vivid colors, post-impressionist',
  'watercolor': 'watercolor painting, soft flowing colors, wet on wet technique, artistic, delicate washes',
  'cyberpunk': 'cyberpunk, neon lights, futuristic city, rain reflections, blade runner aesthetic, 4k',
  'anime': 'anime style, studio ghibli, detailed illustration, vibrant colors, manga art',
  'realistic': 'photorealistic, 8k uhd, DSLR photo, sharp focus, high detail, professional photography',
  'oil-painting': 'oil painting, classical art, rich textures, chiaroscuro lighting, museum quality',
  'digital-art': 'digital art, concept art, artstation trending, highly detailed, sharp lines',
  'pixel-art': 'pixel art, 16-bit, retro game style, crisp pixels, vibrant palette',
  'abstract': 'abstract art, geometric shapes, bold colors, modern art, expressionist',
  'impressionist': 'impressionist painting, loose brushstrokes, natural light, Monet style, soft edges',
  'pop-art': 'pop art, Andy Warhol style, bold outlines, flat colors, halftone dots',
  'minimalist': 'minimalist, clean lines, simple shapes, negative space, modern design',
  'surreal': 'surrealism, Salvador Dali style, dreamlike, impossible scenes, hyper detailed',
  'comic-book': 'comic book style, bold ink outlines, halftone shading, Marvel DC style',
  'sketch': 'pencil sketch, detailed line art, graphite drawing, fine art, cross hatching'
};

const qualityBooster = 'masterpiece, best quality, highly detailed, sharp focus, professional, award winning';

const enhancePrompt = (prompt, style) => {
  let enhanced = prompt;
  if (style !== 'default' && styles[style]) {
    enhanced = `${prompt}, ${styles[style]}`;
  }
  // Add quality boosters
  enhanced = `${enhanced}, ${qualityBooster}`;
  // Remove any negative/vague words that confuse the model
  enhanced = enhanced.replace(/\b(bad|ugly|blurry|low quality|simple)\b/gi, '');
  return enhanced.trim();
};

// AI image generation using Pollinations — waits for image to be ready
const generateImage = (enhancedPrompt) => {
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const negativePrompt = encodeURIComponent('blurry, bad anatomy, ugly, low quality, watermark, text, deformed, disfigured');
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&enhance=true&negative=${negativePrompt}&seed=${Math.floor(Math.random() * 99999)}`;
};

const waitForImage = async (url, retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      if (response.status === 200) return true;
    } catch (e) {
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
};

// Generate AI Art
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, style = 'default' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let enhancedPrompt = enhancePrompt(prompt, style);

    const imageUrl = generateImage(enhancedPrompt);
    
    // Wait for Pollinations to actually generate the image
    const ready = await waitForImage(imageUrl);
    if (!ready) {
      return res.status(500).json({ error: 'Image generation timed out, please try again' });
    }

    res.json({ imageUrl, enhancedPrompt });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Save art (private to my collection)
router.post('/save', auth, async (req, res) => {
  try {
    const { title, prompt, imageUrl, style = 'default', tags = [] } = req.body;
    const art = new Art({ title, prompt, imageUrl, user: req.user._id, style, tags, isPublic: false });
    await art.save();
    await art.populate('user', 'username avatar');
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save art' });
  }
});

// Publish art (saves + makes public in gallery)
router.post('/publish', auth, async (req, res) => {
  try {
    const { title, prompt, imageUrl, style = 'default', tags = [] } = req.body;
    const art = new Art({ title, prompt, imageUrl, user: req.user._id, style, tags, isPublic: true });
    await art.save();
    await art.populate('user', 'username avatar');
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish art' });
  }
});

// Toggle publish/unpublish from my collection
router.patch('/:id/toggle-publish', auth, async (req, res) => {
  try {
    const art = await Art.findOne({ _id: req.params.id, user: req.user._id });
    if (!art) return res.status(404).json({ error: 'Art not found or unauthorized' });
    art.isPublic = !art.isPublic;
    await art.save();
    await art.populate('user', 'username avatar');
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle publish' });
  }
});

// Get all gallery art
router.get('/gallery', async (req, res) => {
  try {
    const arts = await Art.find({ isPublic: true })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(arts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Get user's collection
router.get('/my-collection', auth, async (req, res) => {
  try {
    console.log('Fetching collection for user:', req.user._id);
    const arts = await Art.find({ user: req.user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    console.log('Found arts:', arts.length);
    res.json(arts);
  } catch (error) {
    console.error('Collection fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Like/Unlike art
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);
    const isLiked = art.likes.includes(req.user._id);
    
    if (isLiked) {
      art.likes.pull(req.user._id);
    } else {
      art.likes.push(req.user._id);
    }
    
    await art.save();
    await art.populate('user', 'username avatar');
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// Add comment (one per user)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { comment, text } = req.body;
    const commentText = comment || text;
    
    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    
    // Check if user already commented
    const existingCommentIndex = art.comments.findIndex(
      c => c.user.toString() === req.user._id.toString()
    );
    
    if (existingCommentIndex !== -1) {
      return res.status(400).json({ error: 'You have already commented on this artwork' });
    }
    
    art.comments.push({ user: req.user._id, text: commentText.trim() });
    await art.save();
    await art.populate('comments.user', 'username avatar');
    
    res.json({ comments: art.comments });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Edit comment
router.patch('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    
    const comment = art.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    comment.text = text.trim();
    await art.save();
    await art.populate('comments.user', 'username avatar');
    
    res.json({ comments: art.comments });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

// Delete comment
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    
    const comment = art.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    comment.deleteOne();
    await art.save();
    await art.populate('comments.user', 'username avatar');
    
    res.json({ comments: art.comments });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Remix art
router.post('/:id/remix', auth, async (req, res) => {
  try {
    const { newPrompt, style = 'default', title } = req.body;
    const originalArt = await Art.findById(req.params.id);
    
    let enhancedPrompt = enhancePrompt(newPrompt, style);
    
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const negativePrompt = encodeURIComponent('blurry, bad anatomy, ugly, low quality, watermark, text, deformed');
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&enhance=true&negative=${negativePrompt}&seed=${Math.floor(Math.random() * 99999)}`;
    
    const remixArt = new Art({
      title: title || `Remix of ${originalArt.title || 'Untitled'}`,
      prompt: newPrompt,
      imageUrl,
      user: req.user._id,
      style,
      isRemix: true,
      originalArt: originalArt._id
    });
    
    await remixArt.save();
    await remixArt.populate('user', 'username avatar');
    
    res.json({ art: remixArt, imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remix art' });
  }
});

// Update art title
router.patch('/:id/title', auth, async (req, res) => {
  try {
    console.log('Update title request:', { artId: req.params.id, userId: req.user._id, title: req.body.title });
    const { title } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const art = await Art.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: title.trim() },
      { new: true }
    ).populate('user', 'username avatar');
    
    console.log('Updated art:', art);
    
    if (!art) {
      console.log('Art not found or unauthorized');
      return res.status(404).json({ error: 'Art not found or unauthorized' });
    }
    
    res.json(art);
  } catch (error) {
    console.error('Title update error:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
});

// Delete user's own art
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Delete request:', { artId: req.params.id, userId: req.user._id });
    const art = await Art.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    console.log('Deleted art:', art);
    if (!art) {
      console.log('Art not found or unauthorized');
      return res.status(404).json({ error: 'Art not found or unauthorized' });
    }
    res.json({ message: 'Art deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete art' });
  }
});

// Get specific art by ID (must be last to avoid conflicts)
router.get('/:id', async (req, res) => {
  try {
    const art = await Art.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');
    if (!art) {
      return res.status(404).json({ error: 'Art not found' });
    }
    res.json(art);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

// Admin: Delete any art
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    await Art.findByIdAndDelete(req.params.id);
    res.json({ message: 'Art deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete art' });
  }
});

module.exports = router;
