import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { XIcon, TrashIcon, LinkIcon, PlusCircleIcon, PlayCircleIcon, VideoCameraIcon } from './IconComponents'; // Assuming these icons exist
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

import useUserData from '../hooks/useUserData';

interface PlaylistItem {
  id: string; // YouTube Video ID
  title: string;
  thumbnail: string;
}

// Ensure you've added react-youtube to your index.html import map:
// "react-youtube": "https://esm.sh/react-youtube?external=react"

const VideoPlayer: React.FC = () => {
  const { theme } = useTheme();
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [playlist, setPlaylist] = useUserData<PlaylistItem[]>('video-playlist', []);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? (LIGHT_ACCENT_COLOR.split('-')[1] || '500') : (DARK_ACCENT_COLOR.split('-')[1] || '400');

  // Theme-aware styles
  const pageBgClass = theme === 'light' ? 'bg-slate-100' : theme === 'dark' ? 'bg-slate-900' : 'bg-black';
  const headerBgClass = theme === 'light' ? 'bg-white/90 backdrop-blur-md' : theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-md' : 'bg-gray-900/90 backdrop-blur-md'; // Added backdrop-blur for sticky
  const headerBorderClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700';
  const headerTitleClass = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`;
  const backButtonBase = `p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`;
  const backButtonBgClass = theme === 'light' ? `bg-slate-200 hover:bg-slate-300 focus-visible:ring-${accentColorName}-500 focus-visible:ring-offset-white` : theme === 'dark' ? `bg-slate-700 hover:bg-slate-600 focus-visible:ring-${accentColorName}-400 focus-visible:ring-offset-slate-800` : `bg-gray-800 hover:bg-gray-700 focus-visible:ring-${accentColorName}-400 focus-visible:ring-offset-black`;
  const backButtonIconClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';

  const inputContainerBgClass = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const inputLabelClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const inputBaseClass = `w-full px-3 py-2.5 rounded-lg border shadow-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 text-sm`;
  const inputClasses = theme === 'light'
    ? `bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-${accentColorName}-500 focus:border-${accentColorName}-500`
    : theme === 'dark' ? `bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-500 focus:ring-${accentColorName}-400 focus:border-${accentColorName}-400` : `bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-${accentColorName}-400 focus:border-${accentColorName}-400`;
  
  const addButtonTextClass = 'text-white';
  const addButtonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200 > 900 ? 900 : parseInt(accentShade) + 200}`;
  const addButtonFocusRingClass = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 200 < 100 ? 100 : parseInt(accentShade) - 200}`;


  const videoPlayerWrapperBorderClass = theme === 'light' ? 'border-slate-300' : 'border-slate-700';
  const playlistContainerBgClass = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const playlistContainerBorderClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700';
  const playlistTitleClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  
  const playlistItemBaseClass = `flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out shadow-sm border`;
  const playlistItemDefaultBgClass = theme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300' : theme === 'dark' ? 'bg-slate-700/70 border-slate-600/80 hover:bg-slate-700 hover:border-slate-600' : 'bg-gray-800/70 border-gray-700/80 hover:bg-gray-800 hover:border-gray-700';
  const playlistItemActiveBgClass = theme === 'light' ? `bg-${accentColorName}-50 border-${accentColorName}-400 shadow-md` : theme === 'dark' ? `bg-${accentColorName}-500/30 border-${accentColorName}-500 shadow-md` : `bg-${accentColorName}-900/30 border-${accentColorName}-800 shadow-md`;
  const playlistItemThumbnailBorderClass = theme === 'light' ? 'border-slate-300' : 'border-slate-600';
  const playlistItemTitleClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const removeButtonBase = `p-1.5 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-1`;
  const removeButtonClasses = theme === 'light' 
    ? `text-slate-500 hover:bg-red-100 hover:text-red-600 focus-visible:ring-red-500 focus-visible:ring-offset-slate-50` 
    : `text-slate-400 hover:bg-red-500/20 hover:text-red-400 focus-visible:ring-red-400 focus-visible:ring-offset-slate-700/70`;

  const emptyPlaylistTextClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';


  const extractVideoId = (url: string): string | null => {
    const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const fetchVideoDetails = async (id: string): Promise<PlaylistItem | null> => {
    try {
      // Use the oEmbed endpoint to get video details without an API key
      const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`);
      if (!response.ok) {
        // Fallback for private videos or errors
        console.warn(`Could not fetch title for video ${id}. Status: ${response.status}`);
        const thumbnail = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
        return { id, title: `Video ID: ${id}`, thumbnail };
      }
      const data = await response.json();
      const thumbnail = data.thumbnail_url || `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      return { id, title: data.title, thumbnail };
    } catch (error) {
      console.error("Error fetching video details:", error);
      // Fallback in case of network error
      const thumbnail = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      return { id, title: `Video ID: ${id}`, thumbnail };
    }
  };


  const handleAddToPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(videoUrlInput.trim());
    if (id) {
      const videoItem = await fetchVideoDetails(id);
      if (videoItem) {
        setPlaylist(prev => {
          if (prev.find(v => v.id === id)) return prev; 
          return [...prev, videoItem];
        });
        setVideoUrlInput('');
        if (!currentVideoId) {
          setCurrentVideoId(id);
        }
      } else {
         alert("Could not fetch video details. The YouTube video might be private or not exist.");
      }
    } else {
      alert("Please enter a valid YouTube URL.");
    }
  };

  const handlePlayVideo = (id: string) => {
    setCurrentVideoId(id);
  };

  const handleRemoveFromPlaylist = (idToRemove: string) => {
    const removedVideoIndex = playlist.findIndex(video => video.id === idToRemove);
    const newPlaylist = playlist.filter(video => video.id !== idToRemove);
    setPlaylist(newPlaylist);

    if (currentVideoId === idToRemove) {
      if (newPlaylist.length === 0) {
        setCurrentVideoId(null);
      } else {
        const nextVideoIndex = Math.min(removedVideoIndex, newPlaylist.length - 1);
        setCurrentVideoId(newPlaylist[nextVideoIndex].id);
      }
    }
  };
  
  const handleVideoEnd = () => {
    const currentIndex = playlist.findIndex(video => video.id === currentVideoId);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      setCurrentVideoId(playlist[currentIndex + 1].id);
    }
  };

  useEffect(() => {
    const originalTitle = document.title;
    if (currentVideoId) {
      const currentVideo = playlist.find(v => v.id === currentVideoId);
      document.title = currentVideo ? `${currentVideo.title} - Video Player` : "Video Player";
    } else {
      document.title = "Video Player - Learnixus";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [currentVideoId, playlist]);

  return (
    <div className={`min-h-screen flex flex-col ${pageBgClass} transition-colors duration-300`}>
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6">
        {/* Video Section & Input Form */}
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
          <form onSubmit={handleAddToPlaylist} className={`p-4 rounded-xl shadow-lg ${inputContainerBgClass} border ${playlistContainerBorderClass}`}>
            <label htmlFor="videoUrl" className={`block text-sm font-medium ${inputLabelClass} mb-1.5`}>
              Add YouTube Video to Playlist
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className={`w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <input
                  type="text"
                  id="videoUrl"
                  placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=...)"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className={`${inputBaseClass} ${inputClasses} pl-9`}
                />
              </div>
              <button
                type="submit"
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold ${addButtonTextClass} ${addButtonBgClass} shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${addButtonFocusRingClass} ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} text-sm`}
                disabled={!videoUrlInput.trim()}
              >
                <PlusCircleIcon className="w-5 h-5" />
                Add
              </button>
            </div>
          </form>

          <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-xl border ${videoPlayerWrapperBorderClass} ${theme === 'light' ? 'bg-black' : 'bg-black'}`}>
            {currentVideoId ? (
              <YouTube
                videoId={currentVideoId}
                opts={{
                  width: '100%',
                  height: '100%', 
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                    controls: 1,
                    iv_load_policy: 3, 
                  },
                }}
                onReady={(event) => {
                  playerRef.current = event.target;
                }}
                onEnd={handleVideoEnd}
                className="w-full h-full" 
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center ${theme === 'light' ? 'bg-slate-200 text-slate-500' : 'bg-slate-700 text-slate-400'}`}>
                <VideoCameraIcon className="w-16 h-16 opacity-50 mb-4" />
                <p className="text-lg font-medium">No video selected.</p>
                <p className="text-sm">Add a video to the playlist to start watching.</p>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Section */}
        <div className={`lg:w-96 w-full flex-shrink-0 ${playlistContainerBgClass} rounded-2xl p-4 shadow-xl border ${playlistContainerBorderClass}`}>
          <div className="flex items-center gap-2 border-b pb-3 mb-3 ${playlistContainerBorderClass}">
            <PlayCircleIcon className={`w-6 h-6 ${playlistTitleClass}`} />
            <h2 className={`text-lg font-semibold ${playlistTitleClass}`}>Playlist ({playlist.length})</h2>
          </div>
          {playlist.length > 0 ? (
            <div className="space-y-2.5 max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1"> {/* Adjusted max-h */}
              {playlist.map((video) => (
                <div
                  key={video.id}
                  className={`${playlistItemBaseClass} ${currentVideoId === video.id ? playlistItemActiveBgClass : playlistItemDefaultBgClass}`}
                >
                  <img
                    src={video.thumbnail}
                    alt={`Thumbnail for ${video.title}`}
                    className={`w-20 h-12 rounded object-cover border ${playlistItemThumbnailBorderClass} flex-shrink-0 cursor-pointer`}
                    onClick={() => handlePlayVideo(video.id)} 
                    aria-hidden="true" 
                  />
                  <div className="flex-grow min-w-0 cursor-pointer" onClick={() => handlePlayVideo(video.id)}>
                    <p className={`text-sm font-medium ${playlistItemTitleClass} truncate`} title={video.title}>
                      {video.title}
                    </p>
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePlayVideo(video.id); }}
                        className={`mt-1 text-xs font-semibold ${currentVideoId === video.id ? (theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-300`) : (theme === 'light' ? `text-${accentColorName}-500` : `text-${accentColorName}-400`)} hover:underline`}
                        aria-label={`Play ${video.title}`}
                    >
                        Play Video
                    </button>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(video.id);}}
                    className={`${removeButtonBase} ${removeButtonClasses} flex-shrink-0`}
                    aria-label={`Remove ${video.title} from playlist`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${emptyPlaylistTextClass} text-center py-10`}>
              Your playlist is empty. Add some videos to get started!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;