import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ReviewTranscript() {
  const { id } = useParams();
  const personId = parseInt(id || '0');
  const [, setLocation] = useLocation();
  
  const [transcript, setTranscript] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [notes, setNotes] = useState('');

  const { toast } = useToast();

  // Get data from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTranscript(urlParams.get('transcript') || '');
    setVisitDate(urlParams.get('date') || '');
    setNotes(urlParams.get('notes') || '');
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analyze', {
        transcript,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Transcript analyzed successfully!",
      });
      
      // Navigate to summary page with all data
      const params = new URLSearchParams({
        transcript,
        date: visitDate,
        notes,
        summary: data.summary,
        followups: JSON.stringify(data.followups),
        scriptures: JSON.stringify(data.scriptures),
        talks: JSON.stringify(data.talks),
      });
      setLocation(`/person/${personId}/summary?${params.toString()}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to analyze transcript. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Transcript cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Review Transcript</h1>
        <p className="text-slate-600">Review and edit the transcript before AI analysis</p>
      </div>

      {/* Visit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-info-circle text-faith-blue"></i>
            Visit Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-slate-600">Visit Date:</span>
              <p className="text-slate-900">{new Date(visitDate).toLocaleDateString()}</p>
            </div>
            {notes && (
              <div>
                <span className="text-sm font-medium text-slate-600">Notes:</span>
                <p className="text-slate-900">{notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-edit text-faith-green"></i>
            Edit Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Review the transcript below and make any necessary corrections. The AI will use this 
                to generate insights and recommendations.
              </p>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your transcript will appear here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <i className="fas fa-lightbulb text-amber-600 mt-0.5"></i>
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Editing Tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Correct any transcription errors</li>
                    <li>• Add context that might be missing</li>
                    <li>• Include spiritual impressions you received</li>
                    <li>• Note any specific needs or concerns mentioned</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character count */}
      <div className="text-right">
        <span className="text-sm text-slate-500">
          {transcript.length} characters
        </span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => setLocation(`/person/${personId}/record`)}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Recording
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={analyzeMutation.isPending || !transcript.trim()}
          className="bg-faith-blue hover:bg-blue-700 text-white"
        >
          {analyzeMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Analyzing...
            </>
          ) : (
            <>
              <i className="fas fa-brain mr-2"></i>
              Analyze with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
