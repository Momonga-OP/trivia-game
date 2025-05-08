import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Lore.css';
import { useSound } from '../contexts/SoundContext.jsx';
import BackgroundAnimation from './BackgroundAnimation';
import FloatingParticles from './FloatingParticles';
import StoryBook from './StoryBook';

// Note: Lore files are now imported directly in the StoryBook component

// Lore component to display Dofus lore chapters
function Lore({ navigateTo }) {
  const [showStoryBook, setShowStoryBook] = useState(true);

  // Get sound functions from context
  const { playSound } = useSound();
  const navigate = useNavigate();

  // Handle closing the StoryBook
  const handleCloseStoryBook = () => {
    setShowStoryBook(false);
    // Navigate back to home after closing the book
    navigateTo('home');
  };

  // Play sound when component mounts
  useEffect(() => {
    playSound('pageFlip');

    // Disable scrolling on the body when StoryBook is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [playSound]);

  return (
    <div className="lore-container">
      {/* Background elements */}
      <BackgroundAnimation />
      <FloatingParticles count={30} />

      {/* Immersive StoryBook experience */}
      {showStoryBook && (
        <StoryBook onClose={handleCloseStoryBook} />
      )}
    </div>
  );
}

export default Lore;