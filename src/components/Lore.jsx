import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faBook, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './styles/Lore.css';
import { useSound } from '../contexts/SoundContext.jsx';
import BackgroundAnimation from './BackgroundAnimation';
import FloatingParticles from './FloatingParticles';

// Import all lore text files using Vite's import.meta.glob
const loreFiles = import.meta.glob('./assets/DofusLore/*.txt', { as: 'raw', eager: true });

// Lore component to display Dofus lore chapters
function Lore({ navigateTo }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapterContent, setChapterContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  
  // Track mobile state for responsive design
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const contentRef = useRef(null);
  // Track dropdown state for chapter selection
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Get sound functions from context
  const { playSound } = useSound();
  const navigate = useNavigate();

  // Responsive: update isMobile state on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable body scroll when dropdown is open on mobile
  useEffect(() => {
    if (isMobile && isDropdownOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isDropdownOpen]);

  // Generate chapters list from lore files
  useEffect(() => {
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
  }, []);

  // Load chapter content
  useEffect(() => {
    const loadChapter = async () => {
      if (chapters.length === 0 || currentChapter >= chapters.length) {
        return;
      }
      
      setIsLoading(true);
      try {
        const chapter = chapters[currentChapter];
        const content = loreFiles[chapter.path];
        setChapterContent(content || 'Chapter content not found.');
      } catch (error) {
        console.error('Error loading chapter:', error);
        setChapterContent('Error loading chapter content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChapter();
  }, [currentChapter, chapters]);

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

  // Toggle dropdown for chapter selection
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle chapter selection
  const handleChapterClick = (chapterId) => {
    setCurrentChapter(chapterId);
    setIsDropdownOpen(false);
  };

  // Close dropdown on backdrop click
  const handleBackdropClick = () => {
    setIsDropdownOpen(false);
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
          const boldText = cell.trim().replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
          return boldText;
        })
    );
    
    return (
      <div className="table-container" key={tableIndex}>
        <table className="lore-table">
          <thead>
            <tr>
              {headers.map((header, i) => <th key={i}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="lore-container">
      {/* Background Animation */}
      <BackgroundAnimation type="lore" />
      <FloatingParticles count={15} speed={0.5} size={3} color="#ffe082" opacity={0.3} />
      
      {/* Backdrop overlay for dropdown */}
      {isDropdownOpen && (
        <div className="dropdown-backdrop" onClick={handleBackdropClick} />
      )}
      
      {/* Main content area */}
      <div className="lore-content" ref={contentRef}>
        {/* Chapter selector dropdown */}
        <div className="chapter-selector">
          <button 
            className="chapter-dropdown-button"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <FontAwesomeIcon icon={faBook} />
            <span>{chapters.length > 0 && currentChapter < chapters.length ? chapters[currentChapter].title.replace('–', ' ').replace('—', ' ') : 'Select Chapter'}</span>
            <FontAwesomeIcon icon={isDropdownOpen ? faChevronLeft : faArrowRight} className="dropdown-arrow" />
          </button>
          
          {isDropdownOpen && (
            <ul className="chapter-dropdown-list">
              {chapters.map((chapter) => (
                <li
                  key={chapter.id}
                  className={currentChapter === chapter.id ? 'active' : ''}
                  onClick={() => handleChapterClick(chapter.id)}
                >
                  {chapter.title.replace('–', ' ').replace('—', ' ')}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {/* Chapter title - only show on larger screens */}
            {!isMobile && (
              <div className="chapter-header">
                <h2 className="chapter-title">
                  {chapters.length > 0 && currentChapter < chapters.length 
                    ? chapters[currentChapter].title
                      .replace('–', ' ') // Remove en dash
                      .replace('—', ' ') // Remove em dash
                    : 'Chapter Not Found'}
                </h2>
              </div>
            )}
            
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