import Hls from "hls.js";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const HlsPlayer = forwardRef(function HlsPlayer({ lesson, startTime = 0, onProgress }, ref) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    seek: (time) => { if (videoRef.current) videoRef.current.currentTime = Number(time) || 0; },
    play: () => videoRef.current?.play(),
    getState: () => ({
      currentTime: videoRef.current?.currentTime || 0,
      duration: videoRef.current?.duration || lesson.durationSec || 0,
    }),
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const source = lesson.hlsUrl || lesson.mp4Url;
    let hls;

    if (lesson.hlsUrl && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(lesson.hlsUrl);
      hls.attachMedia(video);
    } else if (source && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (lesson.mp4Url) {
      video.src = lesson.mp4Url;
    }

    return () => hls?.destroy();
  }, [lesson._id, lesson.hlsUrl, lesson.mp4Url]);

  if (!lesson.hlsUrl && !lesson.mp4Url) {
    return <div className="grid aspect-video place-items-center rounded-2xl bg-slate-950 text-sm text-slate-400">Video source is unavailable for this lesson.</div>;
  }

  return (
    <video
      ref={videoRef}
      className="aspect-video w-full rounded-2xl bg-black"
      controls
      playsInline
      preload="metadata"
      onLoadedMetadata={(event) => {
        if (startTime > 0 && startTime < event.currentTarget.duration) {
          event.currentTarget.currentTime = startTime;
        }
      }}
      onTimeUpdate={(event) => onProgress?.(event.currentTarget.currentTime, event.currentTarget.duration)}
      onPause={(event) => onProgress?.(event.currentTarget.currentTime, event.currentTarget.duration, true)}
      onEnded={(event) => onProgress?.(event.currentTarget.duration, event.currentTarget.duration, true)}
    />
  );
});

export default HlsPlayer;
