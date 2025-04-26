'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Database, Loader2, X } from 'lucide-react';
import { fetchDatasets, Dataset } from '@/components/modules/datasets/dataset-controller';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function DashboardScreen() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHeader, setSelectedHeader] = useState<{header: string, datasets: {id: string, name: string}[]}>({
    header: '',
    datasets: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean filename helper function
  const cleanFilename = (filename: string) => {
    return filename.replace(/^\d+[-_\s]+/, '');
  };

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDatasets();
        setDatasets(data);
        setError(null);
      } catch (error) {
        setError('Failed to load datasets');
        console.error('Error loading datasets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDatasets();
  }, []);

  const handleHeaderClick = (header: string) => {
    // Find all datasets that contain this header
    const datasetsWithHeader = datasets
      .filter(dataset => dataset.headers.includes(header))
      .map(dataset => ({
        id: dataset.id,
        name: cleanFilename(dataset.filename)
      }));
    
    setSelectedHeader({
      header,
      datasets: datasetsWithHeader
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Dataset Headers Overview</CardTitle>
              </div>
              <Badge variant="outline">{datasets.length} Datasets</Badge>
            </div>
            <CardDescription>Available columns from your uploaded datasets</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center p-8 text-destructive">
                {error}
              </div>
            ) : datasets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No datasets available</p>
                <p className="text-sm mt-1">Upload CSV files from the Datasets section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {datasets.map((dataset) => (
                  <Card key={dataset.id} className="overflow-hidden border-muted/50 bg-background/50">
                    <CardHeader className="p-4 pb-3 bg-muted/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <FileSpreadsheet className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-base">{cleanFilename(dataset.filename)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dataset.rowCount} rows • {new Date(dataset.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {dataset.headers.map((header) => (
                          <Badge 
                            key={`${dataset.id}-${header}`} 
                            variant="secondary"
                            className="text-xs font-normal cursor-pointer hover:bg-secondary/60"
                            onClick={() => handleHeaderClick(header)}
                          >
                            {header}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Column: {selectedHeader.header}</span>
              <DialogClose asChild>
                <Button variant="ghost" className="h-6 w-6 p-0" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              This column appears in {selectedHeader.datasets.length} dataset{selectedHeader.datasets.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="text-sm font-medium">Datasets with this column:</div>
            <div className="bg-muted/30 rounded-md p-3 max-h-64 overflow-auto">
              <ul className="space-y-2">
                {selectedHeader.datasets.map(dataset => (
                  <li key={dataset.id} className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    <span>{dataset.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Tip: Click on any column name in the dashboard to see which datasets contain that column.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
