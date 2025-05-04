/**
 * Utility for generating Dofus-themed images based on chapter titles
 */

// Collection of Dofus-themed images for each chapter theme
const DOFUS_IMAGES = {
  // Age Before Time - cosmic, primordial themes
  cosmic: [
    'https://static.ankama.com/ankama/cms/images/259/2015/03/27/434822.jpg', // Dofus cosmic art
    'https://static.ankama.com/ankama/cms/images/259/2017/05/10/682290.jpg', // Dofus universe
    'https://static.ankama.com/ankama/cms/images/259/2016/09/08/622953.jpg'  // Dofus creation
  ],
  
  // Dragons and ancient civilizations
  dragons: [
    'https://static.ankama.com/ankama/cms/images/259/2014/09/18/430422.jpg', // Dofus dragons
    'https://static.ankama.com/ankama/cms/images/259/2015/11/19/466775.jpg', // Eliatropes
    'https://static.ankama.com/ankama/cms/images/259/2016/01/27/482352.jpg'  // Ancient civilization
  ],
  
  // World creation and gods
  creation: [
    'https://static.ankama.com/ankama/cms/images/259/2015/06/11/444566.jpg', // World of Twelve
    'https://static.ankama.com/ankama/cms/images/259/2017/02/01/665662.jpg', // Dofus world
    'https://static.ankama.com/ankama/cms/images/259/2016/11/03/639326.jpg'  // Creation
  ],
  
  // Magical artifacts and power
  magical: [
    'https://static.ankama.com/ankama/cms/images/259/2016/05/19/533953.jpg', // Dofus eggs
    'https://static.ankama.com/ankama/cms/images/259/2015/09/24/458852.jpg', // Primordial Dofus
    'https://static.ankama.com/ankama/cms/images/259/2017/03/15/671950.jpg'  // Magical artifacts
  ],
  
  // Destruction and catastrophe
  destruction: [
    'https://static.ankama.com/ankama/cms/images/259/2015/02/05/431733.jpg', // Ogrest
    'https://static.ankama.com/ankama/cms/images/259/2016/02/17/486964.jpg', // Ogrest's chaos
    'https://static.ankama.com/ankama/cms/images/259/2016/07/13/553553.jpg'  // Destruction
  ],
  
  // Adventure and heroes
  adventure: [
    'https://static.ankama.com/ankama/cms/images/259/2016/03/02/490876.jpg', // Dofus adventurers
    'https://static.ankama.com/ankama/cms/images/259/2015/12/09/470664.jpg', // Heroes
    'https://static.ankama.com/ankama/cms/images/259/2017/01/18/663323.jpg'  // Adventure
  ],
  
  // Divine conflict and war
  divine: [
    'https://static.ankama.com/ankama/cms/images/259/2016/04/06/505564.jpg', // Gods
    'https://static.ankama.com/ankama/cms/images/259/2015/10/14/461923.jpg', // Divine war
    'https://static.ankama.com/ankama/cms/images/259/2016/08/24/586753.jpg'  // Demons
  ],
  
  // Fellowship and companions
  fellowship: [
    'https://static.ankama.com/ankama/cms/images/259/2015/05/20/442231.jpg', // Brotherhood of Tofu
    'https://static.ankama.com/ankama/cms/images/259/2016/06/01/536442.jpg', // Companions
    'https://static.ankama.com/ankama/cms/images/259/2017/04/05/675332.jpg'  // Fellowship
  ],
  
  // War and conflict
  war: [
    'https://static.ankama.com/ankama/cms/images/259/2015/07/08/448653.jpg', // War
    'https://static.ankama.com/ankama/cms/images/259/2016/10/12/631775.jpg', // Nations
    'https://static.ankama.com/ankama/cms/images/259/2015/08/19/454332.jpg'  // Conflict
  ],
  
  // Gods and immortals
  gods: [
    'https://static.ankama.com/ankama/cms/images/259/2016/12/07/647553.jpg', // Gods
    'https://static.ankama.com/ankama/cms/images/259/2015/04/15/438865.jpg', // Immortals
    'https://static.ankama.com/ankama/cms/images/259/2017/06/21/690442.jpg'  // Divine beings
  ],
  
  // Artifacts and power
  artifacts: [
    'https://static.ankama.com/ankama/cms/images/259/2015/01/14/429654.jpg', // Dofus artifacts
    'https://static.ankama.com/ankama/cms/images/259/2016/11/23/643221.jpg', // Dofus eggs
    'https://static.ankama.com/ankama/cms/images/259/2015/03/04/433765.jpg'  // Power items
  ]
};

// Dofus Touch specific images as alternatives
const DOFUS_TOUCH_IMAGES = [
  'https://static.ankama.com/dofus-touch/www/game/items/200/1234.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/9954.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/8432.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/7653.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/6543.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/5432.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/4321.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/3210.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/2109.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/1098.png',
  'https://static.ankama.com/dofus-touch/www/game/items/200/9876.png'
];

// Chapter theme mapping
const CHAPTER_THEMES = {
  0: 'cosmic',      // Age Before Time
  1: 'dragons',     // First Civilization Eliatropes and Dragons
  2: 'creation',    // Birth of the World of Twelve
  3: 'magical',     // Coming of the Primordial Dofus
  4: 'destruction', // Ogrest's Wrath
  5: 'adventure',   // Age of Adventurers
  6: 'divine',      // Demons, Gods, and the Divine War
  7: 'fellowship',  // Rise of the Brotherhood of the Tofu
  8: 'war',         // War of the Nations
  9: 'gods',        // Time of the Gods
  10: 'artifacts'   // Dofus Era
};

/**
 * Generate a Dofus-themed image URL for a specific chapter
 * @param {string} chapterTitle - The title of the chapter
 * @param {number} chapterIndex - The index of the chapter (0-10)
 * @returns {string} - URL for a Dofus-themed image
 */
export const generateImageForChapter = (chapterTitle, chapterIndex = 0) => {
  // Get the theme for this chapter
  const theme = CHAPTER_THEMES[chapterIndex] || 'cosmic';
  
  // Get the image collection for this theme
  const images = DOFUS_IMAGES[theme] || DOFUS_IMAGES.cosmic;
  
  // 20% chance to use a Dofus Touch image instead
  if (Math.random() < 0.2) {
    return DOFUS_TOUCH_IMAGES[chapterIndex] || DOFUS_TOUCH_IMAGES[0];
  }
  
  // Select a random image from the collection
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

/**
 * Generate a new Dofus image for a chapter that's different from the current one
 * @param {string} chapterTitle - The title of the chapter
 * @param {number} chapterIndex - The index of the chapter (0-10)
 * @param {string} currentImageUrl - The current image URL to avoid duplicating
 * @returns {string} - URL for a new Dofus-themed image
 */
export const generateNewImage = (chapterTitle, chapterIndex = 0, currentImageUrl = '') => {
  // 30% chance to switch between Dofus and Dofus Touch
  if (Math.random() < 0.3) {
    // If current is a Dofus Touch image, get a Dofus image
    if (currentImageUrl.includes('dofus-touch')) {
      const theme = CHAPTER_THEMES[chapterIndex] || 'cosmic';
      const images = DOFUS_IMAGES[theme] || DOFUS_IMAGES.cosmic;
      const randomIndex = Math.floor(Math.random() * images.length);
      return images[randomIndex];
    } else {
      // Otherwise get a Dofus Touch image
      return DOFUS_TOUCH_IMAGES[chapterIndex] || DOFUS_TOUCH_IMAGES[0];
    }
  }
  
  // Regular image rotation within the same collection
  if (currentImageUrl.includes('dofus-touch')) {
    // Get a different Dofus Touch image
    const availableImages = DOFUS_TOUCH_IMAGES.filter(img => img !== currentImageUrl);
    return availableImages[Math.floor(Math.random() * availableImages.length)];
  } else {
    // Get a different Dofus image
    const theme = CHAPTER_THEMES[chapterIndex] || 'cosmic';
    const images = DOFUS_IMAGES[theme] || DOFUS_IMAGES.cosmic;
    
    // Filter out the current image
    const availableImages = images.filter(img => img !== currentImageUrl);
    
    // If we have other options, pick one randomly
    if (availableImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      return availableImages[randomIndex];
    }
    
    // If we only had one image, return a random image from another theme
    const allThemes = Object.keys(DOFUS_IMAGES);
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    const randomImages = DOFUS_IMAGES[randomTheme];
    return randomImages[Math.floor(Math.random() * randomImages.length)];
  }
};

// Fallback image in case all else fails - using a Dofus-themed image
export const FALLBACK_IMAGE = 'https://static.ankama.com/ankama/cms/images/259/2015/03/27/434822.jpg';
