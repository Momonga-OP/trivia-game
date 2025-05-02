import React from 'react';

function About({ navigateTo }) {
  return (
    <div className="about-page">
      <h1>About Dofus Lore Trivia</h1>
      
      <div className="about-content">
        <p>
          Welcome to Dofus Lore Trivia, a game designed to test and expand your knowledge
          of the rich world of Dofus and the World of Twelve.
        </p>
        
        <p>
          This game features hundreds of questions about Dofus lore, characters, items,
          monsters, and game mechanics. Whether you're a veteran player or new to the
          world of Dofus, you'll find questions that challenge and entertain you.
        </p>
        
        <p>
          Dofus is a tactical turn-based MMORPG developed by Ankama Games, set in the
          fantasy world of the Krosmoz. The game revolves around the search for the six
          precious dragon eggs called Dofus.
        </p>
        
        <h2>How to Play</h2>
        <p>
          Answer as many questions correctly as you can before the timer runs out.
          Each correct answer adds to your score. At the end, you'll see your
          performance statistics.
        </p>
      </div>
      
      <button className="btn btn-secondary" onClick={() => navigateTo('home')}>
        Back to Home
      </button>
    </div>
  );
}

export default About;
