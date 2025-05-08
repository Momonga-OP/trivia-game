import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import './styles/StoryBook.css';
import { useSound } from '../contexts/SoundContext.jsx';
import { preloadBookSounds, optimizeSoundsForMobile } from '../utils/BookSoundPreloader';

// Import all lore text files using Vite's import.meta.glob
const loreFiles = import.meta.glob('./assets/DofusLore/*.txt', { as: 'raw', eager: true });

// Log available lore files for debugging
console.log('Available lore files:', Object.keys(loreFiles));

// Fallback content in case lore files can't be loaded
const fallbackChapters = [
  { id: 0, title: 'Prologue – The Age Before Time' },
  { id: 1, title: 'Chapter 1 – The First Civilization' },
  { id: 2, title: 'Chapter 2 – The Birth of the World of Twelve' },
  { id: 3, title: 'Chapter 3 – The Coming of the Primordial Dofus' },
  { id: 4, title: 'Chapter 4 – Ogrest\'s Wrath' },
  { id: 5, title: 'Chapter 5 – The Age of Adventurers' },
  { id: 6, title: 'Chapter 6 – Demons, Gods, and the Divine War' }
];

const fallbackContent = {
  0: "Before time itself, there was nothing but the Krosmoz—an endless void filled with infinite possibilities. From this cosmic soup emerged the first gods, primordial beings of immense power who would shape the universe as we know it.",
  1: "The Eliatropes and their dragon siblings were the first civilization to inhabit the World of Twelve. These powerful beings could manipulate Wakfu, the primordial energy of creation, to build magnificent cities and technologies beyond imagination.",
  2: "The World of Twelve was born from the dreams of the god Xelor, who sought to create a realm where time flowed in perfect harmony. He enlisted the help of eleven other gods, each contributing their essence to form the world.",
  3: "The six Primordial Dofus—dragon eggs containing immense power—were scattered across the world. Each Dofus represented a different element and contained the essence of a dragon god, waiting to be awakened.",
  4: "Ogrest, a creature created by the alchemist Otomai, fell madly in love with a doll brought to life. When she was lost to him, his grief was so immense that his tears flooded the world, forever changing its landscape.",
  5: "Following Ogrest's Chaos, a new era began where adventurers from all walks of life set out to explore the changed world, seeking fortune, power, and the legendary Dofus eggs that could grant them godlike abilities.",
  6: "The gods and demons have waged war since the beginning of time. Their battles shaped the cosmos and continue to influence the World of Twelve, with mortals often caught in the crossfire of their divine conflicts."
};

const StoryBook = ({ onClose }) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('index');
  const [chapters, setChapters] = useState([]);
  const [chapterContent, setChapterContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [useFallbackUI, setUseFallbackUI] = useState(false); // For Discord compatibility
  
  // Refs
  const bookRef = useRef(null);
  const pageRef = useRef(null);
  
  // Sound effects from context
  const { playSound } = useSound();
  
  // Safe sound playing function with error handling
  const playSoundSafely = (soundName) => {
    if (soundEnabled) {
      try {
        playSound(soundName);
      } catch (error) {
        console.warn(`Error playing sound ${soundName}:`, error);
      }
    }
  };
  
  // Generate CSS-based particles for magical effect (more performant than canvas)
  const generateParticles = () => {
    // We'll use CSS-based particles instead of canvas for better performance
    // The particles are now created using CSS in StoryBook.css
    console.log('Using CSS-based particles for better performance');
  };
  
  // Load chapters from lore files
  useEffect(() => {
    try {
      // Check if we have lore files
      if (Object.keys(loreFiles).length > 0) {
        console.log('Loading lore files from import');
        // Extract chapter info from filenames
        const chapterList = Object.keys(loreFiles).map((path, index) => {
          // Extract filename from path
          const filename = path.split('/').pop();
          // Remove .txt extension
          const title = filename.replace('.txt', '');
          return { id: index, title, path };
        });
        
        // Sort chapters (Prologue first, then by chapter number)
        chapterList.sort((a, b) => {
          if (a.title.includes('Prologue')) return -1;
          if (b.title.includes('Prologue')) return 1;
          
          // Extract chapter numbers for sorting
          const aMatch = a.title.match(/Chapter (\d+)/);
          const bMatch = b.title.match(/Chapter (\d+)/);
          
          if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          }
          
          return a.title.localeCompare(b.title);
        });
        
        setChapters(chapterList);
      } else {
        // Use fallback chapters if no lore files are found
        console.log('Using fallback chapters');
        setChapters(fallbackChapters);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      // Use fallback chapters on error
      setChapters(fallbackChapters);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle book opening animation and initialization
  useEffect(() => {
    console.log('Initializing StoryBook component');
    
    // Check if we're in Discord or on a mobile device
    const isDiscordOrMobile = 
      typeof window !== 'undefined' && (
        window.location.href.includes('discord') || 
        navigator.userAgent.includes('Discord') ||
        window.innerWidth <= 600 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    
    // Use fallback UI for Discord or mobile
    if (isDiscordOrMobile) {
      console.log('Using fallback UI for Discord/mobile compatibility');
      setUseFallbackUI(true);
    }
    
    // Preload book sound effects for better performance
    try {
      // Preload book-related sound effects
      const soundsLoaded = preloadBookSounds();
      if (!soundsLoaded) {
        console.warn('Sound effects could not be preloaded, continuing without sounds');
        setSoundEnabled(false);
      }
      
      // Optimize sounds for mobile devices
      optimizeSoundsForMobile();
    } catch (error) {
      console.error('Error initializing sound effects:', error);
      setSoundEnabled(false);
    }
    
    // Delay opening animation to allow for initial render
    const timer = setTimeout(() => {
      try {
        setIsOpen(true);
        playSoundSafely('bookOpen');
      } catch (error) {
        console.error('Error during book opening animation:', error);
        // If animation fails, use fallback UI
        setUseFallbackUI(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [playSound, soundEnabled]);
  
  // Load chapter content when a chapter is selected
  useEffect(() => {
    if (currentPage === 'index' || !chapters.length) return;
    
    const loadChapter = async () => {
      setIsLoading(true);
      try {
        const chapterId = parseInt(currentPage);
        if (isNaN(chapterId) || chapterId >= chapters.length) {
          setCurrentPage('index');
          return;
        }
        
        const chapter = chapters[chapterId];
        
        // Try to load content from lore files
        if (chapter.path && loreFiles[chapter.path]) {
          console.log(`Loading chapter ${chapterId} from file:`, chapter.path);
          const content = loreFiles[chapter.path];
          setChapterContent(content || fallbackContent[chapterId] || 'Chapter content not found.');
        } else {
          // Use fallback content if file not found
          console.log(`Using fallback content for chapter ${chapterId}`);
          setChapterContent(fallbackContent[chapterId] || 'Chapter content not found.');
        }
      } catch (error) {
        console.error('Error loading chapter:', error);
        // Try to use fallback content on error
        const chapterId = parseInt(currentPage);
        if (!isNaN(chapterId) && fallbackContent[chapterId]) {
          setChapterContent(fallbackContent[chapterId]);
        } else {
          setChapterContent('Error loading chapter content. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChapter();
  }, [currentPage, chapters]);
  
  // Handle chapter selection
  const selectChapter = (chapterId) => {
    playSoundSafely('pageFlip');
    
    // Animate page turn
    if (pageRef.current) {
      pageRef.current.classList.add('page-turn');
      
      setTimeout(() => {
        setCurrentPage(chapterId);
        
        setTimeout(() => {
          if (pageRef.current) {
            pageRef.current.classList.remove('page-turn');
          }
        }, 50);
      }, 300);
    } else {
      setCurrentPage(chapterId);
    }
  };
  
  // Navigate to next chapter
  const goToNextChapter = () => {
    const currentChapterId = parseInt(currentPage);
    if (!isNaN(currentChapterId) && currentChapterId < chapters.length - 1) {
      selectChapter(currentChapterId + 1);
    }
  };
  
  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    const currentChapterId = parseInt(currentPage);
    if (!isNaN(currentChapterId) && currentChapterId > 0) {
      selectChapter(currentChapterId - 1);
    } else if (currentPage !== 'index') {
      selectChapter('index');
    }
  };
  
  // Toggle sound effects
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Format chapter content with paragraphs and tables
  const formatContent = (content) => {
    if (!content) return null;
    
    // Split content by paragraphs (empty lines)
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a Markdown-style table
      if (paragraph.includes('|') && paragraph.includes('---')) {
        return renderTable(paragraph, index);
      }
      
      // Remove em dashes between words as requested
      const formattedParagraph = paragraph
        // Remove em dashes with spaces
        .replace(/(\s)—(\s)/g, ' ')
        // Remove en dashes with spaces
        .replace(/ – /g, ' ')
        // Remove em dashes between words
        .replace(/([a-zA-Z0-9])—([a-zA-Z0-9])/g, '$1 $2')
        // Remove any remaining em dashes
        .replace(/—/g, '');
      
      // Render as paragraph with proper RTL direction
      return <p key={index}>{formattedParagraph}</p>;
    });
  };
  
  // Render a Markdown-style table as HTML
  const renderTable = (tableText, tableIndex) => {
    const lines = tableText.split('\n').filter(line => line.trim());
    
    // Need at least header and separator
    if (lines.length < 2) return <p key={tableIndex}>{tableText}</p>;
    
    // Extract headers
    const headerLine = lines[0];
    const headers = headerLine
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());
    
    // Skip the separator line (line with dashes)
    
    // Extract rows (skip header and separator)
    const rows = lines.slice(2).map(line => 
      line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => {
          // Handle bold text (wrapped in ** or __)
          const boldText = cell.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
          return boldText;
        })
    );
    
    return (
      <div className="table-container" key={tableIndex}>
        <table className="lore-table">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Handle book close
  const handleClose = () => {
    if (soundEnabled) {
      playSoundSafely('bookClose');
    }
    
    // Animate book closing
    setIsOpen(false);
    
    // Delay actual closing to allow for animation
    setTimeout(() => {
      onClose();
    }, 600);
  };
  
  // Handle book click when closed
  const handleBookClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (soundEnabled) {
        playSound('pageFlip');
      }
    }
  };
  
  // Render either the immersive 3D book UI or a simplified fallback UI for Discord/mobile
  return (
    <div className="storybook-container">
      {useFallbackUI ? (
        // Fallback UI for Discord and mobile - simpler and more reliable
        <div className="fallback-book-container">
          <div className="fallback-book-header">
            <h1>Chronicles of the World of Twelve</h1>
            <button 
              className="close-button"
              onClick={handleClose}
              aria-label="Close book"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="fallback-book-content">
            {currentPage === 'index' ? (
              <div className="fallback-index-page">
                {isLoading ? (
                  <p>Loading chapters...</p>
                ) : (
                  <ul className="fallback-chapter-list">
                    {chapters.map((chapter) => (
                      <li 
                        key={chapter.id} 
                        className="fallback-chapter-item"
                        onClick={() => selectChapter(chapter.id)}
                      >
                        {chapter.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="fallback-chapter-content">
                {isLoading ? (
                  <p>Loading chapter content...</p>
                ) : (
                  <>
                    <h2>{chapters[parseInt(currentPage)]?.title}</h2>
                    {formatContent(chapterContent)}
                  </>
                )}
                
                <div className="fallback-nav-buttons">
                  <button 
                    className="fallback-nav-button"
                    onClick={goToPreviousChapter}
                    disabled={currentPage === 'index'}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} /> Previous
                  </button>
                  
                  <button 
                    className="fallback-nav-button"
                    onClick={() => setCurrentPage('index')}
                  >
                    Back to Index
                  </button>
                  
                  <button 
                    className="fallback-nav-button"
                    onClick={goToNextChapter}
                    disabled={parseInt(currentPage) === chapters.length - 1}
                  >
                    Next <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Immersive 3D book UI for desktop browsers
        <>
          {/* CSS-based magical particles */}
          <div className="ambient-particles">
            {/* Generate 10 particles */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="particle" />
            ))}
          </div>
          
          {/* Book */}
          <div 
            ref={bookRef} 
            className={`book ${isOpen ? 'open' : 'closed'}`}
            onClick={!isOpen ? handleBookClick : undefined}
          >
            {/* Book spine */}
            <div className="book-spine"></div>
            
            {/* Book cover */}
            <div className="book-cover">
              <div className="book-emblem"></div>
              <div className="book-edge"></div>
            </div>
            
            {/* Book pages */}
            <div className="book-pages">
              <div ref={pageRef} className="book-page">
                {currentPage === 'index' ? (
                  <div className="index-page">
                    <h1 className="index-title">Chronicles of the World of Twelve</h1>
                    {isLoading ? (
                      <p>Loading chapters...</p>
                    ) : (
                      <ul className="chapter-list">
                        {chapters.map((chapter) => (
                          <li 
                            key={chapter.id} 
                            className="chapter-item"
                            onClick={() => selectChapter(chapter.id)}
                            onMouseEnter={() => playSoundSafely('pageRustle')}
                          >
                            {chapter.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="chapter-content">
                    {isLoading ? (
                      <p>Loading chapter content...</p>
                    ) : (
                      <>
                        <h1>{chapters[parseInt(currentPage)]?.title}</h1>
                        {formatContent(chapterContent)}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation controls */}
            {isOpen && (
              <div className="book-controls">
                <button 
                  className="nav-button"
                  onClick={goToPreviousChapter}
                  onMouseEnter={() => soundEnabled && playSound('pageRustle')}
                  disabled={currentPage === 'index'}
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                
                <button 
                  className="nav-button"
                  onClick={currentPage === 'index' ? () => selectChapter(0) : goToNextChapter}
                  onMouseEnter={() => soundEnabled && playSound('pageRustle')}
                  disabled={currentPage !== 'index' && parseInt(currentPage) === chapters.length - 1}
                  aria-label="Next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
          
          {/* Opening prompt */}
          {!isOpen && (
            <div className="opening-prompt">
              Click to open the book
            </div>
          )}
          
          {/* Close button */}
          {isOpen && (
            <button 
              className="close-button"
              onClick={handleClose}
              aria-label="Close book"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
          
          {/* Sound toggle */}
          {isOpen && (
            <button 
              className="sound-toggle"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
            >
              <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default StoryBook;
