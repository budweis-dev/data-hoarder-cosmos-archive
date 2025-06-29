
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface FileData {
  name: string;
  size: number;
  type: string;
  hash: string;
  content: ArrayBuffer;
  category: string;
}

export const useFileSystem = () => {
  const [isSupported, setIsSupported] = useState(
    'showOpenFilePicker' in window
  );
  const { toast } = useToast();

  // Calculate SHA-256 hash of file content
  const calculateHash = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Categorize file based on extension
  const categorizeFile = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
      return 'Images';
    } else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(ext || '')) {
      return 'Videos';
    } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      return 'Documents';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
      return 'Audio';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return 'Archives';
    } else {
      return 'Other';
    }
  };

  const selectFiles = useCallback(async (): Promise<FileData[]> => {
    if (!isSupported) {
      toast({
        title: "File System Access Not Supported",
        description: "Your browser doesn't support the File System Access API.",
        variant: "destructive",
      });
      return [];
    }

    try {
      const fileHandles = await (window as any).showOpenFilePicker({
        multiple: true,
        excludeAcceptAllOption: true,
        types: [
          {
            description: 'All supported files',
            accept: {
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
              'video/*': ['.mp4', '.avi', '.mkv', '.mov', '.wmv'],
              'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
              'application/*': ['.pdf', '.zip', '.rar', '.7z'],
              'text/*': ['.txt', '.md', '.doc', '.docx'],
            },
          },
        ],
      });

      const files: FileData[] = [];
      
      for (const fileHandle of fileHandles) {
        const file = await fileHandle.getFile();
        const content = await file.arrayBuffer();
        const hash = await calculateHash(content);
        const category = categorizeFile(file.name);

        files.push({
          name: file.name,
          size: file.size,
          type: file.type,
          hash,
          content,
          category,
        });
      }

      return files;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('File selection failed:', error);
        toast({
          title: "File Selection Failed",
          description: "Unable to select files. Please try again.",
          variant: "destructive",
        });
      }
      return [];
    }
  }, [isSupported, toast]);

  return {
    isSupported,
    selectFiles,
  };
};
