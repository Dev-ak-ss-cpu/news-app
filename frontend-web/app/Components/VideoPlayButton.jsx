"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { getYouTubeId } from "../Helper";

const SIZES = {
  sm: { box: "h-7 w-7", icon: 11 },
  md: { box: "h-9 w-9", icon: 14 },
  lg: { box: "h-11 w-11 md:h-12 md:w-12", icon: 18 },
};

/**
 * Play badge for the corner of a thumbnail. Opens the YouTube video in an
 * overlay instead of following the card's link.
 */
export default function VideoPlayButton({
  videoUrl,
  title = "",
  size = "md",
  className = "",
  label = "",
}) {
  // `isOpen` only flips on a click, so the portal never runs during SSR.
  const [isOpen, setIsOpen] = useState(false);

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!videoId) return null;

  const { box, icon } = SIZES[size] || SIZES.md;

  // The badge sits inside the card's <Link>, so keep the click to itself.
  const openVideo = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openVideo}
        aria-label={title ? `वीडियो चलाएँ: ${title}` : "वीडियो चलाएँ"}
        className={`inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white/70 transition-transform duration-300 hover:scale-110 hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 ${
          label ? "px-3 py-1.5" : `justify-center ${box}`
        } ${className}`}
      >
        <Play size={icon} className="translate-x-px fill-current" />
        {label && <span className="text-xs font-semibold">{label}</span>}
      </button>

      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title || "वीडियो"}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <div
              className="relative w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="बंद करें"
                className="absolute -top-11 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={title || "Video player"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>

              {title && (
                <p className="mt-3 line-clamp-2 text-center text-sm text-white/85">
                  {title}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
