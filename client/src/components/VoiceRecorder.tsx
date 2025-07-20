import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isProcessing = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  const useRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isRecording 
              ? 'bg-faith-red bg-opacity-20 animate-pulse' 
              : 'bg-faith-blue bg-opacity-10'
          }`}>
            <i className={`text-2xl ${
              isRecording 
                ? 'fas fa-stop text-faith-red' 
                : 'fas fa-microphone text-faith-blue'
            }`}></i>
          </div>
          
          <div className="text-2xl font-mono font-semibold text-slate-900 mb-2">
            {formatTime(recordingTime)}
          </div>
          
          {isRecording && (
            <p className="text-sm text-faith-red font-medium">Recording in progress...</p>
          )}
          
          {audioBlob && !isRecording && (
            <p className="text-sm text-faith-green font-medium">Recording completed!</p>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div className="mb-4">
            <audio controls className="w-full mb-3">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="space-y-3">
          {!isRecording && !audioBlob && (
            <Button 
              onClick={startRecording}
              className="w-full bg-faith-blue hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              <i className="fas fa-microphone mr-2"></i>
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button 
              onClick={stopRecording}
              className="w-full bg-faith-red hover:bg-red-700 text-white"
            >
              <i className="fas fa-stop mr-2"></i>
              Stop Recording
            </Button>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-2">
              <Button 
                onClick={useRecording}
                className="w-full bg-faith-green hover:bg-green-700 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Use This Recording
                  </>
                )}
              </Button>
              
              <Button 
                onClick={resetRecording}
                variant="outline"
                className="w-full"
                disabled={isProcessing}
              >
                <i className="fas fa-redo mr-2"></i>
                Record Again
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Speak clearly and ensure you're in a quiet environment for best results.
        </p>
      </CardContent>
    </Card>
  );
}
