import React, { useState, useEffect } from 'react';
import './styles/Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Allow animation to complete
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className={`notification ${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="notification-icon">
        {type === 'success' && <i className="fas fa-check-circle"></i>}
        {type === 'error' && <i className="fas fa-exclamation-circle"></i>}
        {type === 'info' && <i className="fas fa-info-circle"></i>}
        {type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
      </div>
      <div className="notification-message">{message}</div>
      <button className="notification-close" onClick={() => setVisible(false)}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;
