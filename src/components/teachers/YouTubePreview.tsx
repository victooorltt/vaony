"use client";

import { useState } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";

/**
 * Click-to-play YouTube facade: shows the poster frame and only loads the
 * player once the visitor asks for it, so profiles stay fast and cookie-free
 * until then.
 */
export function YouTubePreview({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-vaony-ink/8 bg-vaony-ink shadow-lg shadow-vaony-ink/10">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-200 group-hover:scale-110">
              <PlayIcon className="ml-1 h-7 w-7 text-vaony-blue" />
            </span>
          </span>
          <span className="sr-only">Reproducir el vídeo de presentación de {title}</span>
        </button>
      )}
    </div>
  );
}
