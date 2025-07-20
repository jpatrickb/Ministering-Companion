import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function VisitSummary() {
  const { id } = useParams();
  const personId = parseInt(id || '0');
  const [, setLocation] = useLocation();
  
  const [summaryData, setSummaryData] = useState({
    transcript: '',
    date: '',
    notes: '',
    summary: '',
    followups: [] as string[],
    scriptures: [] as string[],
    talks: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get data from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSummaryData({
      transcript: urlParams.get('transcript') || '',
      date: urlParams.get('date') || '',
      notes: urlParams.get('notes') || '',
      summary: urlParams.get('summary') || '',
      followups: JSON.parse(urlParams.get('followups') || '[]'),
      scriptures: JSON.parse(urlParams.get('scriptures') || '[]'),
      talks: JSON.parse(urlParams.get('talks') || '[]'),
    });
  }, []);

  const saveEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/save_entry', {
        personId,
        date: summaryData.date,
        transcript: summaryData.transcript,
        summary: summaryData.summary,
        followups: summaryData.followups,
        scriptures: summaryData.scriptures,
        talks: summaryData.talks,
        notes: summaryData.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      
      toast({
        title: "Success",
        description: "Visit entry saved successfully!",
      });
      
      setLocation(`/person/${personId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveEntryMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Visit Summary</h1>
        <p className="text-slate-600">AI-generated insights and recommendations</p>
      </div>

      {/* Visit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-calendar text-faith-blue"></i>
            Visit Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-slate-600">Date:</span>
              <p className="text-slate-900">{new Date(summaryData.date).toLocaleDateString()}</p>
            </div>
            {summaryData.notes && (
              <div>
                <span className="text-sm font-medium text-slate-600">Notes:</span>
                <p className="text-slate-900">{summaryData.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-brain text-faith-green"></i>
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-slate-800 leading-relaxed">
              {summaryData.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Follow-up Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-tasks text-faith-blue"></i>
              Follow-up Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryData.followups.length > 0 ? (
              <ul className="space-y-3">
                {summaryData.followups.map((followup, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-faith-blue bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-faith-blue">{index + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700">{followup}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No specific follow-up actions suggested.</p>
            )}
          </CardContent>
        </Card>

        {/* Scripture References */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-book text-amber-600"></i>
              Scripture References
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryData.scriptures.length > 0 ? (
              <ul className="space-y-2">
                {summaryData.scriptures.map((scripture, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <i className="fas fa-quote-left text-amber-600 text-xs mt-1 flex-shrink-0"></i>
                    <p className="text-sm text-slate-700">{scripture}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No scripture references suggested.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conference Talks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-microphone text-faith-red"></i>
            Recommended Conference Talks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryData.talks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {summaryData.talks.map((talk, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-play-circle text-faith-red mt-0.5"></i>
                    <p className="text-sm text-slate-700">{talk}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No conference talks suggested.</p>
          )}
        </CardContent>
      </Card>

      {/* Transcript Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-file-alt text-slate-600"></i>
            Original Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {summaryData.transcript}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => setLocation(`/person/${personId}/review?transcript=${encodeURIComponent(summaryData.transcript)}&date=${summaryData.date}&notes=${encodeURIComponent(summaryData.notes)}`)}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Edit
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation(`/person/${personId}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveEntryMutation.isPending}
            className="bg-faith-green hover:bg-green-700 text-white"
          >
            {saveEntryMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Entry
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
