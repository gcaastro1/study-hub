"use client";

import { useState, useEffect } from "react";
import SpotifyPlayerLib from "react-spotify-web-playback";
import { useAuth } from "@/context/AuthContext";

export default function SpotifyPlayer() {
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // If not logged into the main app, force logout of Spotify
    if (!user) {
      setToken(null);
      localStorage.removeItem("spotify_access_token");
      return;
    }

    // Check URL for tokens
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("spotify_access_token");
    
    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("spotify_access_token", accessToken);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [user]);

  if (!token) {
    return (
      <div className="fixed bottom-4 right-4 z-50 glass-panel p-4 flex items-center gap-3 w-80">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.9c.36.181.54.78.301 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Conectar ao Spotify</p>
          <p className="text-xs text-foreground/50">{user ? "Requer conta Premium" : "Faça login no app primeiro"}</p>
        </div>
        {user ? (
          <a 
            href="/api/spotify/login" 
            className="bg-green-500 text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-400 transition-colors"
          >
            Conectar
          </a>
        ) : (
          <button 
            disabled
            className="bg-surface-border text-foreground/30 px-3 py-1.5 rounded-full text-xs font-bold cursor-not-allowed"
          >
            Conectar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[350px] shadow-2xl rounded-xl overflow-hidden border border-surface-border">
      <SpotifyPlayerLib
        token={token}
        uris={["spotify:playlist:0vvXsWCC9xrXsKd4ZsnsnJ"]}
        showSaveIcon
        callback={state => {
          if (!state.isPlaying && state.status === "ERROR") {
             // Handle token expiration or not premium
             if (state.error === "Authentication failed" || state.error === "Web Playback SDK is not active") {
               localStorage.removeItem("spotify_access_token");
               setToken(null);
             }
          }
        }}
        styles={{
          activeColor: '#1cbed6',
          bgColor: 'rgba(20,20,20,0.95)',
          color: '#fff',
          loaderColor: '#1cbed6',
          sliderColor: '#1cbed6',
          trackArtistColor: '#ccc',
          trackNameColor: '#fff',
        }}
      />
    </div>
  );
}
