import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinisteredPerson } from "@shared/schema";

interface PersonCardProps {
  person: MinisteredPerson & {
    lastEntryPreview?: string;
    lastContact?: Date | string;
    totalEntries?: number;
  };
}

export default function PersonCard({ person }: PersonCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
    ];
    return gradients[index % gradients.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No contact yet';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(person.id)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getInitials(person.name)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{person.name}</h4>
              <p className="text-sm text-slate-500">{person.family || 'Individual'}</p>
            </div>
          </div>
          <Badge className={`text-xs ${getStatusColor(person.status)}`}>
            {person.status === 'follow-up' ? 'Follow-up' : person.status}
          </Badge>
        </div>
        
        {person.lastEntryPreview && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 line-clamp-2">
              "{person.lastEntryPreview}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <span>Last contact: {formatDate(person.lastContact)}</span>
          <span>{person.totalEntries || 0} entries</span>
        </div>

        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-faith-blue text-white hover:bg-blue-700 text-sm"
            onClick={() => window.location.href = `/person/${person.id}/record`}
          >
            <i className="fas fa-microphone mr-2"></i>
            Record Visit
          </Button>
          <Button
            variant="outline"
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
            onClick={() => window.location.href = `/person/${person.id}`}
          >
            <i className="fas fa-eye mr-2"></i>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
