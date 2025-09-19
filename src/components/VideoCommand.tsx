'use client';

import React, { useState } from 'react';
import { Command, CommandGroup, CommandItem, CommandList } from './ui/command';
import { VideoList } from '@/lib/videoList';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const VideoCommand = ({
  videoList,
  handleVideoSelect,
  selectedVideo,
}: {
  videoList: VideoList[];
  handleVideoSelect: (video: string) => void;
  selectedVideo: string;
}) => {
  const [commandValue, setCommandValue] = useState('');

  const handleMouseLeave = () => {
    setCommandValue('');
  };

  const renderVideoList = () => {
    return videoList.map((video, index) => {
      const isSelected = selectedVideo === video.videoSource;

      return (
        <CommandItem
          key={index}
          value={video.videoSource}
          onSelect={() => handleVideoSelect(video.videoSource)}
          className={cn(
            'cursor-pointer transition-colors duration-100',
            'hover:bg-accent hover:text-accent-foreground',
            isSelected && 'bg-accent text-accent-foreground font-bold',
          )}>
          <div className="flex items-center justify-between w-full">
            <span>{video.name}</span>
            {isSelected && <Check className="h-4 w-4 text-primary" />}
          </div>
        </CommandItem>
      );
    });
  };

  return (
    <div onMouseLeave={handleMouseLeave}>
      <Command value={commandValue} onValueChange={setCommandValue}>
        <CommandList>
          <CommandGroup heading="Select a Nubly feature">
            {renderVideoList()}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default VideoCommand;
