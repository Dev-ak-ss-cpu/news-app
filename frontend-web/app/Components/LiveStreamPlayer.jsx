import { useEffect, useRef, useState, useId } from "react";
import { getYouTubeId } from "../Helper";

export function LiveStreamPlayer({ videoId, videoUrl, small = false }) {
  const playerRef = useRef(null);
  const [isLive, setIsLive] = useState(true);

  // Accepts either a bare video ID or any full YouTube link
  const resolvedId = getYouTubeId(videoUrl || videoId);

  // Use React's useId() for stable, unique IDs that match between server and client
  const reactId = useId();
  const uniqueId = `livePlayer-${resolvedId}-${reactId.replace(/:/g, '-')}`;

  // A new stream starts out live again
  useEffect(() => {
    setIsLive(true);
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;

    function createPlayer() {
      if (!window.YT || !window.YT.Player) return;
      if (!document.getElementById(uniqueId)) return;

      playerRef.current = new window.YT.Player(uniqueId, {
        videoId: resolvedId,
        playerVars: { autoplay: 1, mute: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === 0) setIsLive(false);
          },
        },
      });
    }

    // Only run on client
    if (typeof window === 'undefined') return;

    // --- FIX: API loaded already? Initialize right away ---
    if (window.YT && window.YT.Player) {
      createPlayer();
      return () => destroyPlayer();
    }

    // --- FIX: Support multiple pending components ---
    if (!window._ytReadyCallbacks) {
      window._ytReadyCallbacks = [];
    }
    window._ytReadyCallbacks.push(createPlayer);

    // Load script ONCE
    if (!window._ytScriptLoading) {
      window._ytScriptLoading = true;

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      // When API is ready → run ALL queued callbacks
      window.onYouTubeIframeAPIReady = () => {
        window._ytReadyCallbacks.forEach((cb) => cb());
      };
    }

    // Drop the queued callback and player when the stream changes or unmounts
    return () => {
      const queue = window._ytReadyCallbacks || [];
      const index = queue.indexOf(createPlayer);
      if (index > -1) queue.splice(index, 1);
      destroyPlayer();
    };

    function destroyPlayer() {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    }
  }, [resolvedId, uniqueId]);

  if (!resolvedId) return null;

  return (
    <div
      className={`relative ${
        small ? "w-full h-40 min-h-[160px]" : "w-full aspect-video"
      } rounded-lg overflow-hidden`}
    >
      {isLive ? (
        <div
          id={uniqueId}
          className="w-full h-full min-h-[160px]"
        ></div>
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center text-white text-sm font-semibold">
          LIVE stream ended. Check back later.
        </div>
      )}

      <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-bold text-white">
        LIVE
      </div>
    </div>
  );
}
