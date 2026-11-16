import React, { useRef, useState } from 'react';
import { PodcastEpisode } from '../lib/podcast';

interface PodcastPlayerProps {
  episode: PodcastEpisode;
}

export default function PodcastPlayer({ episode }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="podcast-player">
      <div className="podcast-info">
        <h3>{episode.title}</h3>
        <p>{episode.description}</p>
      </div>
      
      <div className="player-controls">
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '暂停' : '播放'}
        </button>
        
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(episode.duration)}</span>
        </div>
      </div>

      <div className="transcript">
        <h4>文字稿</h4>
        <div className="transcript-content">
          {episode.transcript}
        </div>
      </div>

      <style jsx>{`
        .podcast-player {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .podcast-info {
          margin-bottom: 20px;
        }

        .podcast-info h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .player-controls {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .play-button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .play-button:hover {
          background: #0051cc;
        }

        .time-display {
          font-family: monospace;
          color: #666;
        }

        .transcript {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .transcript h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .transcript-content {
          font-size: 0.9em;
          line-height: 1.6;
          color: #666;
          max-height: 200px;
          overflow-y: auto;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 