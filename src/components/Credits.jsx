import React from 'react';

function Credits({ navigateTo }) {
  return (
    <div className="credits-page">
      <h1>Credits</h1>
      
      <div className="credits-content">
        <section className="credit-section">
          <h2>Development</h2>
          <ul>
            <li>Game Design & Development: Your Name</li>
            <li>Question Database: Your Name & Contributors</li>
          </ul>
        </section>
        
        <section className="credit-section">
          <h2>Artwork & Assets</h2>
          <ul>
            <li>Background Images: Various Artists (with permission)</li>
            <li>UI Design: Your Name</li>
            <li>Sound Effects: Various Sources (royalty-free)</li>
          </ul>
        </section>
        
        <section className="credit-section">
          <h2>Special Thanks</h2>
          <ul>
            <li>Ankama Games for creating the wonderful world of Dofus</li>
            <li>The Dofus community for their passion and knowledge</li>
            <li>All beta testers who helped improve the game</li>
          </ul>
        </section>
        
        <section className="credit-section">
          <h2>Contact</h2>
          <p>
            For questions, feedback, or bug reports, please contact:
            <br />
            <a href="mailto:your.email@example.com">your.email@example.com</a>
          </p>
        </section>
      </div>
      
      <button className="btn btn-secondary" onClick={() => navigateTo('home')}>
        Back to Home
      </button>
    </div>
  );
}

export default Credits;
