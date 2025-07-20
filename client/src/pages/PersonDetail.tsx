import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MinisteredPerson, MinisteringEntry } from "@shared/schema";

export default function PersonDetail() {
  const { id } = useParams();
  const personId = parseInt(id || '0');

  const { data: person, isLoading: personLoading } = useQuery<MinisteredPerson>({
    queryKey: ["/api/people", personId],
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<MinisteringEntry[]>({
    queryKey: ["/api/entries"],
    enabled: !!personId,
  });

  const { data: insights = { patterns: [], suggestions: [] } } = useQuery({
    queryKey: ["/api/insights", personId],
    enabled: !!personId && entries.length > 0,
  });

  if (personLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hands-helping text-white text-lg animate-pulse"></i>
          </div>
          <p className="text-slate-600">Loading person details...</p>
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
        <p className="text-slate-600 mb-4">The person you're looking for doesn't exist or you don't have permission to view them.</p>
        <Button onClick={() => window.location.href = '/'}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Person Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {getInitials(person.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{person.name}</h1>
                <p className="text-slate-600">{person.family || 'Individual'}</p>
                {person.tags && person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {person.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => window.location.href = `/person/${person.id}/record`}
                className="bg-faith-blue hover:bg-blue-700 text-white"
              >
                <i className="fas fa-microphone mr-2"></i>
                Record Visit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">{entries.length}</div>
              <div className="text-sm text-slate-600">Total Entries</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900">
                {entries.length > 0 ? formatDate(entries[0].date).split(' ')[0] + ' ' + formatDate(entries[0].date).split(' ')[1] : 'None'}
              </div>
              <div className="text-sm text-slate-600">Last Contact</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-900 capitalize">{person.status}</div>
              <div className="text-sm text-slate-600">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights && (insights.patterns.length > 0 || insights.suggestions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {insights.patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-chart-line text-amber-600"></i>
                  Patterns Observed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.patterns.map((pattern: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <i className="fas fa-circle text-amber-600 text-xs mt-2"></i>
                      <span className="text-sm text-slate-700">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-lightbulb text-faith-green"></i>
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <i className="fas fa-circle text-faith-green text-xs mt-2"></i>
                      <span className="text-sm text-slate-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ministering Entries</span>
            <Button
              onClick={() => window.location.href = `/person/${person.id}/record`}
              size="sm"
              className="bg-faith-blue hover:bg-blue-700 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Entry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book text-slate-400 text-xl"></i>
              </div>
              <h3 className="font-medium text-slate-900 mb-2">No entries yet</h3>
              <p className="text-slate-500 mb-4">Start by recording your first ministering visit.</p>
              <Button
                onClick={() => window.location.href = `/person/${person.id}/record`}
                className="bg-faith-blue hover:bg-blue-700 text-white"
              >
                <i className="fas fa-microphone mr-2"></i>
                Record First Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900">
                      Visit on {formatDate(entry.date)}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {entry.createdAt ? formatDate(entry.createdAt) : ''}
                    </span>
                  </div>
                  
                  {entry.summary && (
                    <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                      {entry.summary}
                    </p>
                  )}

                  {entry.followups && entry.followups.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-slate-600 mb-1">Follow-ups:</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {entry.followups.slice(0, 2).map((followup, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <i className="fas fa-arrow-right text-xs mt-0.5 text-faith-blue"></i>
                            <span>{followup}</span>
                          </li>
                        ))}
                        {entry.followups.length > 2 && (
                          <li className="text-slate-500">+{entry.followups.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-xs text-slate-500">
                      {entry.scriptures && entry.scriptures.length > 0 && (
                        <span>
                          <i className="fas fa-book mr-1"></i>
                          {entry.scriptures.length} scriptures
                        </span>
                      )}
                      {entry.talks && entry.talks.length > 0 && (
                        <span>
                          <i className="fas fa-microphone mr-1"></i>
                          {entry.talks.length} talks
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
