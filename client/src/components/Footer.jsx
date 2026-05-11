import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/anirudhhbehera', icon: <GitHubIcon /> },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/anirudhhbehera/', icon: <LinkedInIcon /> },
  { label: 'Portfolio', href: 'https://anirudhh.vercel.app/', icon: <LanguageIcon /> },
  { label: 'Projects', href: 'https://github.com/anirudhhbehera?tab=repositories', icon: <FolderSpecialIcon /> },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 5,
        px: { xs: 3, sm: 6 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 5, 30, 0.95) 100%)',
        borderTop: '1px solid rgba(168, 85, 247, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899, transparent)',
        }
      }}
    >
      {/* Glow orbs */}
      <Box sx={{
        position: 'absolute', bottom: -60, left: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', bottom: -60, right: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Center content */}
      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Icon + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: '#a855f7' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            AI Art Studio
          </Typography>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: '#ec4899' }} />
        </Box>

        {/* Tagline */}
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.35)', mb: 3, fontSize: '0.8rem', letterSpacing: '0.05em' }}
        >
          Turn your imagination into art
        </Typography>

        {/* Social icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          {socialLinks.map((link) => (
            <Tooltip key={link.label} title={link.label} arrow>
              <IconButton
                component="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  borderRadius: '10px',
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'white',
                    borderColor: 'rgba(168, 85, 247, 0.6)',
                    background: 'rgba(168, 85, 247, 0.15)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)'
                  }
                }}
              >
                {link.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        {/* Divider line */}
        <Box sx={{
          width: 60, height: '1px', mx: 'auto', mb: 2,
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)'
        }} />

        {/* Copyright */}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
          © {currentYear} Anirudhh Behera — All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
