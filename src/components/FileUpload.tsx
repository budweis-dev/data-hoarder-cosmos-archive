
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Check, X } from 'lucide-react';
import { useFileSystem, FileData } from '@/hooks/useFileSystem';
import { usePlayerActions } from '@/hooks/useWeb3';

interface FileUploadProps {
  onFileUploaded: (xpGained: number) => void;
}

export const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { isSupported, selectFiles } = useFileSystem();
  const { uploadFile } = usePlayerActions();

  const handleSelectFiles = async () => {
    const files = await selectFiles();
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let totalXP = 0;
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const xp = await uploadFile(file.name, file.hash, file.size, file.category);
        totalXP += xp;
        
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      onFileUploaded(totalXP);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateTotalXP = (): number => {
    return selectedFiles.reduce((total, file) => {
      return total + Math.floor(file.size / (1024 * 1024)) * 10;
    }, 0);
  };

  if (!isSupported) {
    return (
      <Card className="bg-black/60 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 font-mono flex items-center">
            <X className="h-5 w-5 mr-2" />
            FILE SYSTEM NOT SUPPORTED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Your browser doesn't support the File System Access API. Please use a modern browser like Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-cyan-400 font-mono flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          FILE UPLOAD SYSTEM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button
            onClick={handleSelectFiles}
            disabled={uploading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
          >
            <File className="h-4 w-4 mr-2" />
            SELECT FILES
          </Button>
          
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white font-mono"
            >
              <Upload className="h-4 w-4 mr-2" />
              UPLOAD TO BLOCKCHAIN
            </Button>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uploading...</span>
              <span className="text-white">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-mono text-sm">
                {selectedFiles.length} files selected
              </span>
              <Badge className="bg-green-600/20 text-green-400 border-green-400/50">
                +{calculateTotalXP()} XP potential
              </Badge>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="text-white font-mono text-sm">{file.name}</div>
                    <div className="text-gray-400 text-xs flex items-center space-x-2">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    +{Math.floor(file.size / (1024 * 1024)) * 10} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
