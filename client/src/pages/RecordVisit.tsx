import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useToast } from "@/hooks/use-toast";
import { MinisteredPerson } from "@shared/schema";

export default function RecordVisit() {
  const { id } = useParams();
  const personId = parseInt(id || '0');
  const [visitData, setVisitData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  const { data: person, isLoading } = useQuery<MinisteredPerson>({
    queryKey: ["/api/people", personId],
  });

  const transcribeMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('user_id', 'current_user');
      formData.append('person_id', personId.toString());
      formData.append('date', visitData.date);
      formData.append('notes', visitData.notes);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setTranscript(data.transcript);
      setIsProcessing(false);
      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
      
      // Navigate to review page with transcript data
      const params = new URLSearchParams({
        transcript: data.transcript,
        date: visitData.date,
        notes: visitData.notes,
      });
      window.location.href = `/person/${personId}/review?${params.toString()}`;
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRecordingComplete = (audioBlob: Blob) => {
    setIsProcessing(true);
    transcribeMutation.mutate(audioBlob);
  };

  const handleInputChange = (field: string, value: string) => {
    setVisitData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hands-helping text-white text-lg animate-pulse"></i>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-user-slash text-slate-400 text-xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Person Not Found</h2>
        <p className="text-slate-600 mb-4">The person you're trying to record a visit for doesn't exist.</p>
        <Button onClick={() => window.location.href = '/'}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Record Ministering Visit</h1>
        <p className="text-slate-600">Recording visit for <span className="font-medium">{person.name}</span></p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-calendar text-faith-blue"></i>
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                Visit Date
              </Label>
              <Input
                id="date"
                type="date"
                value={visitData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={visitData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional context or notes about this visit..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <i className="fas fa-info-circle text-faith-blue mt-0.5"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Recording Tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Speak clearly and at a normal pace</li>
                    <li>• Find a quiet environment</li>
                    <li>• Mention key points and follow-up actions</li>
                    <li>• Include spiritual insights and impressions</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-microphone text-faith-red"></i>
                Voice Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceRecorder 
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {transcript && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-file-alt text-faith-green"></i>
                  Live Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {transcript}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => window.location.href = `/person/${personId}`}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Person
        </Button>

        <div className="text-sm text-slate-500">
          After recording, you'll be able to review and edit the transcript
        </div>
      </div>
    </div>
  );
}
