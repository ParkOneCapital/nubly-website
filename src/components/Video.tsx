import React from 'react';
import { cn } from '@/lib/utils';

const Video = (props: { videoSrc: string; className?: string }) => {
  return (
    <video
      key={props.videoSrc}
      autoPlay={false}
      controls
      controlsList="nodownload"
      className={cn('video', props.className)}>
      <source src={props.videoSrc} type="video/mp4" />
      Your browser does not support html video
    </video>
  );
};

export default Video;
