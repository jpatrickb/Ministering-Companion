import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PersonCard from "@/components/PersonCard";
import AddPersonModal from "@/components/AddPersonModal";
import { useAuth } from "@/hooks/useAuth";
import { MinisteredPerson, User } from "@shared/schema";
import christImage from "@assets/image_1753044442351.png";

export default function Dashboard() {
  const { user } = useAuth() as { user: User | null };

  const { data: content } = useQuery({
    queryKey: ["/api/content"],
    queryParams: { category: "dashboard" },
    retry: false,
    select: (data: any[]) => {
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.key] = item.content;
      });
      return contentMap;
    }
  });

  const welcomeMessage = content?.["dashboard-welcome-message"] || "Following Christ's example of love and service through inspired ministering";
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: people = [], isLoading } = useQuery<MinisteredPerson[]>({
    queryKey: ["/api/people"],
  });

  const { data: featuredResources = [] } = useQuery({
    queryKey: ["/api/resources/featured"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hands-helping text-white text-lg animate-pulse"></i>
          </div>
          <p className="text-slate-600">Loading your ministering dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalPeople: people.length,
    lastVisit: people.length > 0 ? "3 days ago" : "No visits yet"
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
          <img 
            src={christImage} 
            alt="Christ's example" 
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Welcome back, {user?.firstName || "Friend"}
        </h2>
        <p className="text-green-100 mb-4">
          {welcomeMessage}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <i className="fas fa-users mr-2"></i>
            <span>{stats.totalPeople} people ministered</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-clock mr-2"></i>
            <span>Last visit: {stats.lastVisit}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 text-left group bg-white border-slate-200 hover:shadow-md"
            onClick={() => {
              if (people.length > 0) {
                window.location.href = `/person/${people[0].id}/record`;
              }
            }}
            disabled={people.length === 0}
          >
            <div className="w-full">
              <div className="w-10 h-10 bg-faith-red bg-opacity-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-opacity-20 transition-colors">
                <i className="fas fa-microphone text-faith-red"></i>
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Record Visit</h4>
              <p className="text-sm text-slate-500">Start recording a new ministering visit</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 text-left group bg-white border-slate-200 hover:shadow-md"
            onClick={() => setShowAddModal(true)}
          >
            <div className="w-full">
              <div className="w-10 h-10 bg-faith-green bg-opacity-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-opacity-20 transition-colors">
                <i className="fas fa-user-plus text-faith-green"></i>
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Add Person</h4>
              <p className="text-sm text-slate-500">Add someone new to minister to</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 text-left group bg-white border-slate-200 hover:shadow-md"
            onClick={() => window.location.href = '/resources'}
          >
            <div className="w-full">
              <div className="w-10 h-10 bg-faith-blue bg-opacity-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-opacity-20 transition-colors">
                <i className="fas fa-book-open text-faith-blue"></i>
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Resources</h4>
              <p className="text-sm text-slate-500">Browse gospel resources and talks</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 text-left group bg-white border-slate-200 hover:shadow-md"
            disabled
          >
            <div className="w-full">
              <div className="w-10 h-10 bg-amber-500 bg-opacity-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-opacity-20 transition-colors">
                <i className="fas fa-chart-line text-amber-600"></i>
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Insights</h4>
              <p className="text-sm text-slate-500">View your ministering patterns</p>
            </div>
          </Button>
        </div>
      </div>

      {/* People I Minister To */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">People I Minister To</h3>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-faith-blue text-white px-4 py-2 hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Person
          </Button>
        </div>

        {people.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-slate-400 text-xl"></i>
              </div>
              <h4 className="font-medium text-slate-900 mb-2">No people added yet</h4>
              <p className="text-slate-500 mb-4">Start by adding the people and families you minister to.</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-faith-blue text-white hover:bg-blue-700">
                <i className="fas fa-plus mr-2"></i>
                Add Your First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity - only show if there are people */}
      {people.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                <div className="p-4 text-center text-slate-500">
                  <i className="fas fa-clock text-2xl mb-2"></i>
                  <p>Recent activity will appear here as you record visits and add entries.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AddPersonModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}
