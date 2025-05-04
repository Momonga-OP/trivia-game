import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faArrowLeft, faArrowRight, faVolumeUp, faVolumeMute, faSync } from '@fortawesome/free-solid-svg-icons';
import './styles/Lore.css';
import { useSound } from '../contexts/SoundContext.jsx';
import BackgroundAnimation from './BackgroundAnimation';
import FloatingParticles from './FloatingParticles';
import { generateImageForChapter, generateNewImage, FALLBACK_IMAGE } from '../utils/ImageGenerator';

// Lore component to display Dofus lore chapters
function Lore({ navigateTo, windowSize }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapterContent, setChapterContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // By default, sidebar is closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  // Always show illustration by default until user turns it off
  const [showIllustration, setShowIllustration] = useState(true);
  const [chapterImages, setChapterImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const contentRef = useRef(null);
  
  // Get sound functions from context
  const { playSound } = useSound();

  // Responsive: update isMobile and sidebar state on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);
  const navigate = useNavigate();

  // Chapter titles in order
  const chapters = [
    { id: 0, title: 'Prologue – The Age Before Time' },
    { id: 1, title: 'Chapter 1 – The First Civilization Eliatropes and Dragons' },
    { id: 2, title: 'Chapter 2 – The Birth of the World of Twelve' },
    { id: 3, title: 'Chapter 3 – The Coming of the Primordial Dofus' },
    { id: 4, title: 'Chapter 4 – Ogrest\'s Wrath' },
    { id: 5, title: 'Chapter 5 – The Age of Adventurers' },
    { id: 6, title: 'Chapter 6 – Demons, Gods, and the Divine War' },
    { id: 7, title: 'Chapter 7 – The Rise of the Brotherhood of the Tofu' },
    { id: 8, title: 'Chapter 8 – The War of the Nations' },
    { id: 9, title: 'Chapter 9 – The Time of the Gods' },
    { id: 10, title: 'Chapter 10 – The Dofus Era' },
  ];

  // Persist illustration preference in localStorage
  useEffect(() => {
    // Only save when user explicitly changes the setting
    if (!isLoading) {
      localStorage.setItem('showIllustration', showIllustration.toString());
    }
  }, [showIllustration, isLoading]);
  
  // Load user preferences on initial load
  useEffect(() => {
    const savedIllustrationPref = localStorage.getItem('showIllustration');
    // Only apply if explicitly set to false, otherwise default to true
    if (savedIllustrationPref === 'false') {
      setShowIllustration(false);
    } else {
      setShowIllustration(true);
    }
  }, []);

  // Load chapter content
  useEffect(() => {
    const loadChapter = async () => {
      setIsLoading(true);
      try {
        // In a development environment, we'll use hardcoded content for demonstration
        // In production, you would fetch from an API endpoint
        const chapterTitle = chapters[currentChapter].title;
        
        // Hardcoded content for each chapter based on the files we've seen
        let text = '';
        
        if (chapterTitle === 'Prologue – The Age Before Time') {
          text = `Before clocks ticked and stars blinked in the night sky, there was only the dance of two forces: Wakfu and Stasis. One pulsed with life, movement, and change — the breath of creation. The other sat still, silent, cold — the weight of stillness. Together, they were the breath and bones of the universe.

In this timeless sea was born the Eliatrope people, wise beings gifted with immortality and deep connection to Wakfu. With them came the Dragons, majestic creatures forged of pure elemental power. Each Dragon was bound to an Eliatrope child — twin souls, sharing fate across lifetimes.

Together, they built a civilization unlike any before or since — towering cities of crystal and floating islands powered by Wakfu veins. Peace reigned, but peace is never eternal. From the stars fell enemies made of logic and metal: the Mechasms, beings who saw the Eliatropes as a threat to the cosmic balance.

What followed was war — beautiful, terrifying, and endless.

To protect their legacy, the Eliatropes fled through dimensions, and their civilization faded like a dream. Only a few remained, sleeping in hidden sanctuaries... waiting. In their wake, the world healed. From its ashes rose new gods, and a new world — the World of Twelve.

But deep beneath the earth, sleeping in the belly of time, the Primordial Dofus — six sacred dragon eggs — stirred with power.

And so begins the true story...`;
        } else if (chapterTitle === 'Chapter 1 – The First Civilization Eliatropes and Dragons') {
          text = `The Eliatropes and their dragon siblings were the first civilization to inhabit the World of Twelve. Born from the cosmic egg of the Goddess Eliatrope and the Great Dragon, they were beings of immense power, capable of manipulating Wakfu — the life energy that flows through all things.

Each Eliatrope was born with a dragon twin, sharing a soul across two bodies. The most powerful of these pairs were the six firstborn: Yugo and Adamaï, Nora and Efrim, Glip and Baltazar, Chibi and Grougaloragran, Qilby and Shinonome, Mina and Phaeris. These six ruled the Eliatrope civilization as the Council of Six.

Their civilization was a marvel of technology and magic. Cities floated in the sky, powered by Wakfu. They mastered dimensional travel through portals, allowing them to explore countless worlds. The Eliatropes were peaceful explorers, scientists, and philosophers who valued knowledge above all else.

But one among them, Qilby, was different. Unlike his siblings who were reborn with no memory of past lives, Qilby remembered everything across his many reincarnations. This endless memory was both gift and curse, driving him to constant exploration and, eventually, to betrayal.

When the mechanical Mechasms arrived from across the stars, Qilby secretly provoked war with them, seeing it as an opportunity for new experiences to relieve his eternal boredom. The resulting conflict devastated the Eliatrope civilization.

In the final days of the war, Yugo, leader of the Eliatropes, discovered Qilby's betrayal and imprisoned him in a timeless dimension called the Blank Dimension. The remaining Eliatropes fled to another dimension with their children in the Zinit, a massive spaceship. Only Baltazar remained behind to guard the Dofus eggs containing the souls of the Council members, hiding them across the world to await the time of rebirth.`;
        } else if (chapterTitle === 'Chapter 2 – The Birth of the World of Twelve') {
          text = `The World of Twelve was born from the ashes of the Eliatrope civilization. The gods, who had been watching from the sidelines, decided to intervene and create a new world. They took the remnants of the Eliatrope civilization and used them to create the World of Twelve.

The World of Twelve was a world of wonder and magic. The gods created the first inhabitants of the world, the humans, and gave them the gift of Wakfu. The humans were tasked with protecting the world and keeping the balance of Wakfu.

The World of Twelve was divided into four nations: the Kingdom of Bonta, the Kingdom of Brakmar, the City-State of Amakna, and the Nation of Sufokia. Each nation had its own unique culture and history.

The World of Twelve was a world of peace and prosperity, but it was not without its challenges. The nations had to work together to protect the world from external threats, and the humans had to learn to control their use of Wakfu.`;
        } else if (chapterTitle === 'Chapter 3 – The Coming of the Primordial Dofus') {
          text = `The Primordial Dofus were six sacred dragon eggs that held the power of the gods. They were hidden across the World of Twelve, waiting for the time of their rebirth.

The Primordial Dofus were said to have the power to grant wishes, and many sought to find them. But the gods had placed a curse on the Dofus, making it impossible for anyone to possess them.

The first to find a Primordial Dofus was a young adventurer named Yugo. He had been searching for the Dofus for years, and finally, he found one in the depths of the forest.

But as soon as Yugo touched the Dofus, he was consumed by its power. He became corrupted and sought to use the Dofus to gain ultimate power.

The other nations of the World of Twelve soon learned of Yugo's discovery and sought to take the Dofus for themselves. A great war broke out, with each nation fighting for control of the Dofus.`;
        } else if (chapterTitle === 'Chapter 4 – Ogrest\'s Wrath') {
          text = `Ogrest was a powerful creature who lived in the mountains of the World of Twelve. He was said to have the power to control the elements, and was feared by all who knew of him.

One day, Ogrest awoke from his slumber and began to wreak havoc on the World of Twelve. He destroyed cities and towns, and killed many innocent people.

The nations of the World of Twelve banded together to stop Ogrest, but he was too powerful. He defeated them all, and the World of Twelve was plunged into darkness.

But there was one who still held hope. A young girl named Dally, who had the power to communicate with Ogrest. She sought to find out why Ogrest was so angry, and to stop him before it was too late.`;
        } else if (chapterTitle === 'Chapter 5 – The Age of Adventurers') {
          text = `The Age of Adventurers was a time of great change in the World of Twelve. The nations were still recovering from the devastation caused by Ogrest, and many were seeking to make a name for themselves.

This was the time of the great adventurers, who sought to explore the unknown and to make their mark on the world. Many famous adventurers emerged during this time, including the legendary adventurer, Yugo.

The Age of Adventurers was also a time of great discovery. Many new lands were discovered, and many new creatures were encountered. The World of Twelve was a place of wonder and excitement, and many sought to explore its secrets.`;
        } else if (chapterTitle === 'Chapter 6 – Demons, Gods, and the Divine War') {
          text = `The Divine War was a great conflict that shook the World of Twelve. It was a war between the gods and the demons, with the fate of the world hanging in the balance.

The gods, who had created the World of Twelve, sought to protect it from the demons, who sought to destroy it. The war raged on for many years, with many great heroes emerging to fight on both sides.

In the end, the gods emerged victorious, but at great cost. The World of Twelve was forever changed, and many were left to pick up the pieces.`;
        } else if (chapterTitle === 'Chapter 7 – The Rise of the Brotherhood of the Tofu') {
          text = `The Brotherhood of the Tofu was a secret society that emerged in the aftermath of the Divine War. They were a group of powerful individuals who sought to use their abilities for good.

The Brotherhood was led by a mysterious figure known only as the "Tofu Master". He was said to have the power to control the very fabric of reality, and was feared by all who knew of him.

The Brotherhood of the Tofu sought to protect the World of Twelve from those who would seek to harm it. They were a powerful force for good, and many looked up to them as heroes.`;
        } else if (chapterTitle === 'Chapter 8 – The War of the Nations') {
          text = `The War of the Nations was a great conflict that shook the World of Twelve. It was a war between the nations, with each seeking to gain dominance over the others.

The war raged on for many years, with many great heroes emerging to fight on both sides. In the end, the Kingdom of Bonta emerged victorious, but at great cost. The World of Twelve was forever changed, and many were left to pick up the pieces.`;
        } else if (chapterTitle === 'Chapter 9 – The Time of the Gods') {
          text = `The Time of the Gods was a period of great upheaval in the World of Twelve. The gods, who had created the world, began to take a more active role in its affairs.

Many great heroes emerged during this time, seeking to do the gods' bidding. The World of Twelve was a place of wonder and excitement, and many sought to explore its secrets.`;
        } else if (chapterTitle === 'Chapter 10 – The Dofus Era') {
          text = `The Dofus Era was a time of great change in the World of Twelve. The Dofus, which had been hidden for so long, began to reappear.

Many sought to possess the Dofus, but they were said to be cursed. Those who possessed them were consumed by their power, and sought to use them for their own gain.

The Dofus Era was a time of great conflict, as many sought to gain control of the Dofus. But it was also a time of great discovery, as many new lands were discovered and many new creatures were encountered.`;
        } else {
          // For other chapters, you would add similar content blocks
          // This is a placeholder for demonstration
          text = `Content for ${chapterTitle} will be available soon...`;
        }
        
        setChapterContent(text);
      } catch (error) {
        console.error('Error loading chapter:', error);
        setChapterContent('Error loading chapter content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [currentChapter]);

  // Generate themed images for each chapter on component mount
  useEffect(() => {
    const generateImages = async () => {
      // Generate initial images for all chapters
      const images = chapters.map((chapter, index) => 
        generateImageForChapter(chapter.title, index)
      );
      setChapterImages(images);
    };
    
    generateImages();
  }, []);
  
  // Regenerate a specific chapter image
  const regenerateImage = () => {
    setIsImageLoading(true);
    playSound('buttonClick');
    
    // Generate a new image for the current chapter that's different from the current one
    const currentImage = chapterImages[currentChapter];
    const newImage = generateNewImage(chapters[currentChapter].title, currentChapter, currentImage);
    
    // Update the image in the array
    setChapterImages(prev => {
      const updated = [...prev];
      updated[currentChapter] = newImage;
      return updated;
    });
    
    // Set a timeout to ensure the loading state is visible
    setTimeout(() => setIsImageLoading(false), 500);
  };

  // Handle navigation between chapters
  const goToNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      playSound('buttonClick');
      setCurrentChapter(currentChapter + 1);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      playSound('buttonClick');
      setCurrentChapter(currentChapter - 1);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const selectChapter = (chapterId) => {
    playSound('buttonClick');
    setCurrentChapter(chapterId);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };
  
  // Toggle illustration visibility
  const toggleIllustration = () => {
    playSound('buttonClick');
    setShowIllustration(!showIllustration);
  };

  // Sidebar behavior: open on hover (desktop), toggle on click (mobile)
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const handleSidebarMouseEnter = () => {
    if (!isMobile) setIsSidebarOpen(true);
  };
  const handleSidebarMouseLeave = () => {
    if (!isMobile) setIsSidebarOpen(false);
  };
  // On chapter click (mobile), auto-close sidebar
  const handleChapterClick = (chapterId) => {
    selectChapter(chapterId);
    if (isMobile) setIsSidebarOpen(false);
  };
  // Close sidebar on backdrop click (mobile)
  const handleBackdropClick = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  // Format chapter content with paragraphs
  const formatContent = (content) => {
    if (!content) return null;
    
    return content.split('\n\n').map((paragraph, index) => (
      paragraph.trim() ? <p key={index}>{paragraph}</p> : null
    )).filter(Boolean);
  };

  return (
    <div className="lore-container">
      {/* Background Animation */}
      <BackgroundAnimation type="lore" />
      <FloatingParticles count={15} speed={0.5} size={3} color="#ffe082" opacity={0.3} />
      
      {/* Mobile backdrop overlay */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={handleBackdropClick} />
      )}
      
      {/* Sidebar with chapter navigation */}
      <div
        className={`lore-sidebar${isSidebarOpen ? ' expanded' : ''}${isMobile ? ' mobile' : ''}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        style={isMobile && isSidebarOpen ? {boxShadow: '4px 0 32px rgba(0,0,0,0.32)'} : {}}
      >
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close chapters' : 'Open chapters'}
          tabIndex={0}
        >
          <FontAwesomeIcon icon={isMobile ? (isSidebarOpen ? 'chevron-left' : 'book') : (isSidebarOpen ? 'chevron-left' : 'book')} />
        </button>
        <span className="sidebar-label" onClick={toggleSidebar}>
          <FontAwesomeIcon icon="book" />
        </span>
        <h3>Dofus Chronicles</h3>
        <ul className="chapter-list">
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={currentChapter === chapter.id ? 'active' : ''}
              onClick={() => handleChapterClick(chapter.id)}
            >
              {chapter.title}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Main content area */}
      <div className="lore-content" ref={contentRef}>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {/* Chapter illustration */}
            {showIllustration && (
              <div className="chapter-illustration-container" data-component-name="Lore">
                {isImageLoading ? (
                  <div className="image-loading">
                    <FontAwesomeIcon icon={faSync} spin />
                    <p>Generating image...</p>
                  </div>
                ) : (
                  <>
                    <img 
                      src={chapterImages[currentChapter] || FALLBACK_IMAGE} 
                      alt={`Illustration for ${chapters[currentChapter].title}`} 
                      className="chapter-illustration"
                      onError={(e) => {
                        console.log('Image failed to load, setting fallback');
                        e.target.src = FALLBACK_IMAGE;
                      }}
                      data-component-name="Lore"
                    />
                    <button 
                      className="regenerate-image-button" 
                      onClick={regenerateImage}
                      title="Generate new image for this chapter"
                      onMouseEnter={() => playSound('buttonHover')}
                    >
                      <FontAwesomeIcon icon={faSync} />
                    </button>
                    <div className="illustration-overlay"></div>
                  </>
                )}
              </div>
            )}
            
            {/* Chapter title and toggle illustration button */}
            <div className="chapter-header">
              <h2 className="chapter-title">{chapters[currentChapter].title}</h2>
              <button 
                className="toggle-illustration-button" 
                onClick={toggleIllustration}
                title={showIllustration ? "Hide illustration" : "Show illustration"}
              >
                <FontAwesomeIcon icon={showIllustration ? faEyeSlash : faEye} />
              </button>
            </div>
            
            {/* Chapter content */}
            <div className="chapter-content">
              {formatContent(chapterContent)}
            </div>
            
            {/* Navigation buttons */}
            <div className="navigation-buttons">
              <button 
                className={`nav-button ${currentChapter === 0 ? 'disabled' : ''}`}
                onClick={goToPreviousChapter}
                disabled={currentChapter === 0}
                onMouseEnter={() => playSound('buttonHover')}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Previous
              </button>
              
              <button 
                className="return-button"
                onClick={() => {
                  playSound('buttonClick');
                  navigateTo('home');
                }}
                onMouseEnter={() => playSound('buttonHover')}
              >
                Return to Home
              </button>
              
              <button 
                className={`nav-button ${currentChapter === chapters.length - 1 ? 'disabled' : ''}`}
                onClick={goToNextChapter}
                disabled={currentChapter === chapters.length - 1}
                onMouseEnter={() => playSound('buttonHover')}
              >
                Next <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Lore;
