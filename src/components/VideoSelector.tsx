import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VideoList } from '@/lib/videoList';

const VideoSelector = ({
  videoList,
  handleVideoSelect,
}: {
  videoList: VideoList[];
  handleVideoSelect: (video: string) => void;
}) => {
  const renderVideoList = () => {
    return videoList.map((video, index) => (
      <SelectItem key={index} value={video.videoSource}>
        {video.name}
      </SelectItem>
    ));
  };

  return (
    <Select onValueChange={(value) => handleVideoSelect(value)}>
      <SelectTrigger className="w-max">
        <SelectValue placeholder={`${videoList[0].name}`} />
      </SelectTrigger>
      <SelectContent>{renderVideoList()}</SelectContent>
    </Select>
  );
};

export default VideoSelector;
