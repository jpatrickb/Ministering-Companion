import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPersonModal({ isOpen, onClose }: AddPersonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    family: '',
    tags: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPersonMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const response = await apiRequest('POST', '/api/people', {
        ...data,
        tags,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      toast({
        title: "Success",
        description: "Person added successfully!",
      });
      setFormData({ name: '', family: '', tags: '' });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add person. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }
    addPersonMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <i className="fas fa-user-plus text-faith-green"></i>
            Add New Person
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="family" className="text-sm font-medium text-slate-700">
              Family/Group
            </Label>
            <Input
              id="family"
              type="text"
              value={formData.family}
              onChange={(e) => handleInputChange('family', e.target.value)}
              placeholder="e.g., Smith Family, Single"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="tags" className="text-sm font-medium text-slate-700">
              Tags (optional)
            </Label>
            <Input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="e.g., new member, young family"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Separate multiple tags with commas</p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={addPersonMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-faith-blue hover:bg-blue-700"
              disabled={addPersonMutation.isPending}
            >
              {addPersonMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                'Add Person'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
