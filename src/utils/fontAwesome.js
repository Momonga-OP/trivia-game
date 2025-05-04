// Font Awesome setup
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome, 
  faQuestionCircle, 
  faCog, 
  faTimes, 
  faVolumeMute, 
  faVolumeUp, 
  faPlay, 
  faInfoCircle, 
  faTrophy, 
  faQuestion, 
  faUsers,
  faArrowRight,
  faStar,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faTimesCircle,
  faBook,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { 
  faDiscord, 
  faTwitter, 
  faGithub, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';

// Configure FontAwesome to use SVG with JS instead of CSS (better for Discord)
config.autoAddCss = false; // Don't automatically add CSS to the document head

// Add all icons to the library
library.add(
  // Solid icons
  faHome,
  faQuestionCircle,
  faCog,
  faTimes,
  faVolumeMute,
  faVolumeUp,
  faPlay,
  faInfoCircle,
  faTrophy,
  faQuestion,
  faUsers,
  faArrowRight,
  faStar,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faTimesCircle,
  faBook,
  faChevronLeft,
  
  // Brand icons
  faDiscord,
  faTwitter,
  faGithub,
  faYoutube
);

export default library;
