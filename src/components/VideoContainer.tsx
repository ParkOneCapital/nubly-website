'use client';

import React, { useState } from 'react';
import Video from './Video';
import { VideoList } from '@/lib/videoList';
import VideoCommand from './VideoCommand';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const VideoContainer = ({ videoList }: { videoList: VideoList[] }) => {
  const [selectedVideo, setSelectedVideo] = useState(videoList[0].videoSource);
  const router = useRouter();
  const handleVideoSelect = (videoSrc: string) => {
    setSelectedVideo(videoSrc);
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-y-5 gap-x-5">
      <Video
        videoSrc={selectedVideo}
        className="flex justify-center items-center w-sm"
      />
      <div className="flex flex-col items-center justify-center gap-y-5">
        <VideoCommand
          videoList={videoList}
          handleVideoSelect={handleVideoSelect}
          selectedVideo={selectedVideo}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default VideoContainer;
