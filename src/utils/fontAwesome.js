// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
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
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  faDiscord, 
  faTwitter, 
  faGithub, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';

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
  
  // Brand icons
  faDiscord,
  faTwitter,
  faGithub,
  faYoutube
);

export default library;
