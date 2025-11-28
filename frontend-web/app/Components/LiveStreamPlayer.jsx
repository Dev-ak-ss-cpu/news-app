import { useEffect, useRef, useState } from "react";

export function LiveStreamPlayer({ videoId, small = false }) {
  const playerRef = useRef(null);
  const [isLive, setIsLive] = useState(true);

  const uniqueId = useRef(
    `livePlayer-${videoId}-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    function createPlayer() {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player(uniqueId.current, {
        videoId,
        playerVars: { autoplay: 1, mute: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === 0) setIsLive(false);
          },
        },
      });
    }

    // --- FIX: API loaded already? Initialize right away ---
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
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
  }, [videoId]);

  return (
    <div
      className={`relative ${
        small ? "w-full h-40 min-h-[160px]" : "w-full aspect-video"
      } rounded-lg overflow-hidden`}
    >
      {isLive ? (
        <div
          id={uniqueId.current}
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
