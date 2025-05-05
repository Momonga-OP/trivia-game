import React, { useState, useEffect } from 'react';
import './styles/VoiceParticipants.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faUserPlus, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import discordService from '../services/DiscordService';
import soundService from '../services/SoundService';

/**
 * Component to display voice channel participants and invite functionality
 */
const VoiceParticipants = ({ isInDiscord }) => {
  const [voiceParticipants, setVoiceParticipants] = useState([]);
  const [speakingState, setSpeakingState] = useState({});
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Listen for voice participant changes
  useEffect(() => {
    if (!isInDiscord) return;

    const handleVoiceParticipantsChange = (event) => {
      setVoiceParticipants(event.detail.participants);
    };

    const handleSpeakingChange = (event) => {
      setSpeakingState(event.detail.speakingState);
    };

    window.addEventListener('discord:voice-participants-changed', handleVoiceParticipantsChange);
    window.addEventListener('discord:speaking-changed', handleSpeakingChange);

    return () => {
      window.removeEventListener('discord:voice-participants-changed', handleVoiceParticipantsChange);
      window.removeEventListener('discord:speaking-changed', handleSpeakingChange);
    };
  }, [isInDiscord]);

  // Generate invite link
  const generateInviteLink = async () => {
    if (!isInDiscord) return;
    
    setGenerating(true);
    soundService.play('buttonClick');
    
    try {
      const code = await discordService.createInviteLink();
      if (code) {
        setInviteLink(`https://discord.gg/${code}`);
        soundService.play('notification');
      }
    } catch (error) {
      console.error('Failed to generate invite link:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (!inviteLink) return;
    
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopied(true);
        soundService.play('success');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy invite link:', err);
      });
  };

  if (!isInDiscord) return null;

  return (
    <div className="voice-participants-container">
      <div className="voice-participants-header">
        <h3>Voice Channel</h3>
        {!inviteLink ? (
          <button 
            className="invite-button" 
            onClick={generateInviteLink}
            disabled={generating}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            {generating ? 'Generating...' : 'Invite'}
          </button>
        ) : (
          <div className="invite-link-container">
            <input 
              type="text" 
              value={inviteLink} 
              readOnly 
              className="invite-link-input"
            />
            <button 
              className="copy-button" 
              onClick={copyInviteLink}
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            </button>
          </div>
        )}
      </div>
      
      <div className="voice-participants-list">
        {voiceParticipants.length === 0 ? (
          <div className="no-voice-participants">No voice participants</div>
        ) : (
          voiceParticipants.map(participant => (
            <div key={participant.user.id} className="voice-participant-item">
              <div className="voice-participant-avatar">
                {participant.user.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${participant.user.id}/${participant.user.avatar}.png`} 
                    alt={participant.user.username} 
                  />
                ) : (
                  <div className="default-avatar">
                    {participant.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="voice-participant-info">
                <span className="voice-participant-name">
                  {participant.user.username}
                </span>
              </div>
              <div className="voice-participant-status">
                <FontAwesomeIcon 
                  icon={speakingState[participant.user.id] ? faMicrophone : faMicrophoneSlash} 
                  className={speakingState[participant.user.id] ? 'speaking' : 'not-speaking'}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceParticipants;
