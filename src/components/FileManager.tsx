
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Zap, CheckCircle, Clock, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileManagerProps {
  playerData: any;
  setPlayerData: (data: any) => void;
}

const categories = [
  { value: 'critical', label: 'Critical Survival', multiplier: 2.0, color: 'text-red-400' },
  { value: 'educational', label: 'Educational', multiplier: 1.5, color: 'text-blue-400' },
  { value: 'cultural', label: 'Cultural', multiplier: 1.2, color: 'text-purple-400' },
  { value: 'entertainment', label: 'Entertainment', multiplier: 1.0, color: 'text-green-400' },
  { value: 'technical', label: 'Technical Docs', multiplier: 1.8, color: 'text-cyan-400' }
];

export const FileManager = ({ playerData, setPlayerData }: FileManagerProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  const calculateXP = (fileSize: number, category: string) => {
    const baseXP = Math.floor(fileSize / (10 * 1024 * 1024)) * 10; // 10 XP per 10MB
    const clampedXP = Math.max(10, Math.min(1000, baseXP)); // Min 10, Max 1000
    const categoryMultiplier = categories.find(c => c.value === category)?.multiplier || 1.0;
    return Math.floor(clampedXP * categoryMultiplier);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a category before uploading files.",
        variant: "destructive",
      });
      return;
    }

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      category: selectedCategory,
      status: 'processing',
      progress: 0,
      xp: calculateXP(file.size, selectedCategory)
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);

    // Simulate upload process
    newUploads.forEach(upload => {
      simulateUpload(upload);
    });
  };

  const simulateUpload = (upload: any) => {
    const interval = setInterval(() => {
      setUploadQueue(prev => 
        prev.map(item => {
          if (item.id === upload.id) {
            const newProgress = Math.min(100, item.progress + Math.random() * 15 + 5);
            
            if (newProgress >= 100) {
              clearInterval(interval);
              
              // Award XP
              setTimeout(() => {
                setPlayerData((prevData: any) => ({
                  ...prevData,
                  totalXP: prevData.totalXP + upload.xp,
                  storageUsed: prevData.storageUsed + upload.size
                }));

                toast({
                  title: "File Processed!",
                  description: `+${upload.xp} XP earned from ${upload.name}`,
                });
              }, 500);
              
              return { ...item, progress: 100, status: 'completed' };
            }
            
            return { ...item, progress: newProgress };
          }
          return item;
        })
      );
    }, 100 + Math.random() * 200);
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-black/60 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            DATA INTAKE PROTOCOL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-mono mb-2 block">CATEGORY</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-black/60 border-cyan-500/30 text-white font-mono">
                  <SelectValue placeholder="Select data category..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-cyan-500/30">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white font-mono">
                      <div className="flex items-center justify-between w-full">
                        <span className={cat.color}>{cat.label}</span>
                        <Badge variant="outline" className="ml-2">
                          {cat.multiplier}x XP
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-gray-600 hover:border-cyan-500/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-mono text-lg mb-2">
              DROP FILES TO PRESERVE
            </p>
            <p className="text-gray-400 text-sm">
              Or click to select files from your system
            </p>
            <Button
              className="mt-4 bg-cyan-600 hover:bg-cyan-700 font-mono"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={!selectedCategory}
            >
              SELECT FILES
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card className="bg-black/60 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                PROCESSING QUEUE ({uploadQueue.length})
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearCompleted}
                className="text-gray-400 border-gray-600 font-mono"
              >
                CLEAR COMPLETED
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadQueue.map(upload => (
                <div key={upload.id} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded">
                  <File className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-mono text-sm truncate">{upload.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={categories.find(c => c.value === upload.category)?.color}>
                          {categories.find(c => c.value === upload.category)?.label}
                        </Badge>
                        <Badge variant="outline" className="text-green-400">
                          <Zap className="h-3 w-3 mr-1" />
                          +{upload.xp} XP
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Progress value={upload.progress} className="flex-1 h-2" />
                      <span className="text-xs text-gray-400 font-mono min-w-[3rem] text-right">
                        {Math.round(upload.progress)}%
                      </span>
                      {upload.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
