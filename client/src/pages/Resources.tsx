import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GospelResource } from "@shared/schema";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: resources = [], isLoading } = useQuery<GospelResource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: featuredResources = [] } = useQuery<GospelResource[]>({
    queryKey: ["/api/resources/featured"],
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'talk':
        return 'fas fa-microphone';
      case 'scripture':
        return 'fas fa-book';
      case 'article':
        return 'fas fa-newspaper';
      case 'service_idea':
        return 'fas fa-hands-helping';
      default:
        return 'fas fa-file';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'talk':
        return 'bg-faith-red bg-opacity-10 text-faith-red';
      case 'scripture':
        return 'bg-faith-blue bg-opacity-10 text-faith-blue';
      case 'article':
        return 'bg-faith-green bg-opacity-10 text-faith-green';
      case 'service_idea':
        return 'bg-amber-500 bg-opacity-10 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-book text-white text-lg animate-pulse"></i>
          </div>
          <p className="text-slate-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Gospel Resources</h1>
        <p className="text-slate-600">Discover talks, scriptures, and service ideas to support your ministering</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === 'talk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('talk')}
              >
                Talks
              </Button>
              <Button
                variant={selectedCategory === 'scripture' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('scripture')}
              >
                Scriptures
              </Button>
              <Button
                variant={selectedCategory === 'article' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('article')}
              >
                Articles
              </Button>
              <Button
                variant={selectedCategory === 'service_idea' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('service_idea')}
              >
                Service Ideas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-slate-400 text-xl"></i>
                </div>
                <h3 className="font-medium text-slate-900 mb-2">No resources found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search terms or filters.' : 'No resources are currently available.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getResourceColor(resource.type)}`}>
                        <i className={`${getResourceIcon(resource.type)} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">
                          {resource.title}
                        </h3>
                        {resource.author && (
                          <p className="text-sm text-slate-600">by {resource.author}</p>
                        )}
                      </div>
                    </div>

                    {resource.description && (
                      <p className="text-sm text-slate-700 line-clamp-3 mb-3">
                        {resource.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {resource.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {resource.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resource.url && window.open(resource.url, '_blank')}
                        >
                          <i className="fas fa-external-link-alt mr-1"></i>
                          View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          {featuredResources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-star text-slate-400 text-xl"></i>
                </div>
                <h3 className="font-medium text-slate-900 mb-2">No featured resources</h3>
                <p className="text-slate-500">Featured resources will appear here when available.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getResourceColor(resource.type)}`}>
                        <i className={`${getResourceIcon(resource.type)} text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {resource.title}
                        </CardTitle>
                        {resource.author && (
                          <p className="text-sm text-slate-600 mt-1">by {resource.author}</p>
                        )}
                      </div>
                      <Badge className="bg-amber-500 text-white">
                        <i className="fas fa-star mr-1"></i>
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-slate-700 mb-4">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {resource.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {resource.url && (
                        <Button
                          onClick={() => resource.url && window.open(resource.url, '_blank')}
                          className="bg-faith-blue hover:bg-blue-700 text-white"
                        >
                          <i className="fas fa-external-link-alt mr-2"></i>
                          View Resource
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
