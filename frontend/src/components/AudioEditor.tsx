"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Scissors, Volume2 } from "lucide-react";

interface AudioEditorProps {
  audioUrl: string;
  transcript: string;
  podcastId: string;
  onSave?: (clippedAudioUrl: string, editedTranscript: string) => void;
}

export function AudioEditor({ audioUrl, transcript, podcastId, onSave }: AudioEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setEndTime(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const setStartMarker = () => {
    setStartTime(currentTime);
  };

  const setEndMarker = () => {
    setEndTime(currentTime);
  };

  const handleClip = async () => {
    console.log(`✂️  Clipping audio from ${startTime}s to ${endTime}s`);

    // In a real implementation, you would:
    // 1. Call a backend API to clip the audio using FFmpeg
    // 2. Upload the clipped audio to S3
    // 3. Return the new URL

    alert(`Audio would be clipped from ${formatTime(startTime)} to ${formatTime(endTime)}\nDuration: ${formatTime(endTime - startTime)}`);

    if (onSave) {
      onSave(audioUrl, editedTranscript);
    }
  };

  const downloadAudio = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `podcast-${podcastId}.mp3`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Volume2 className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold">Audio Player</h3>
        </div>

        <audio ref={audioRef} src={audioUrl} />

        {/* Waveform / Progress Bar */}
        <div className="relative mb-6">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />

          {/* Start and End Markers */}
          <div
            className="absolute top-0 h-2 bg-orange-300/50 pointer-events-none"
            style={{
              left: `${(startTime / duration) * 100}%`,
              right: `${100 - (endTime / duration) * 100}%`,
            }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm text-slate-600 mb-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button onClick={togglePlayPause} className="bg-orange-600 hover:bg-orange-700">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button onClick={setStartMarker} variant="outline" className="border-slate-300">
            Set Start ({formatTime(startTime)})
          </Button>

          <Button onClick={setEndMarker} variant="outline" className="border-slate-300">
            Set End ({formatTime(endTime)})
          </Button>

          <Button onClick={handleClip} variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
            <Scissors className="w-4 h-4 mr-2" />
            Clip ({formatTime(endTime - startTime)})
          </Button>

          <Button onClick={downloadAudio} variant="outline" className="border-slate-300 ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Transcript Editor */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Edit Transcript</h3>
        <textarea
          value={editedTranscript}
          onChange={(e) => setEditedTranscript(e.target.value)}
          className="w-full h-64 p-4 border-2 border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Edit the transcript here..."
        />
        <div className="mt-3 text-sm text-slate-600">
          {editedTranscript.split(/\s+/).length} words (~
          {Math.ceil(editedTranscript.split(/\s+/).length / 150)} min)
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
        <Button
          onClick={() => onSave(audioUrl, editedTranscript)}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg font-medium"
        >
          Save Changes
        </Button>
      )}
    </div>
  );
}
