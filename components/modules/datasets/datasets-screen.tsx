'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Database, 
  FileDown, 
  FileUp, 
  FileText, 
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadCSV } from './actions';
import { DataTable } from './data-table';
import { columns, DatasetEntry, generateColumns } from './columns';
import { Input } from '@/components/ui/input';
import { fetchDatasets, fetchDatasetById, deleteDataset, Dataset } from './dataset-controller';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

// Helper function to clean filenames
const cleanFilename = (filename: string) => {
  // Remove any numbers and special characters at the beginning
  return filename.replace(/^\d+[-_\s]+/, '');
};

const DatasetsScreen = () => {
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [dataColumns, setDataColumns] = useState(columns);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available datasets on mount
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setIsLoadingDatasets(true);
        const datasets = await fetchDatasets();
        setAvailableDatasets(datasets);
      } catch (error) {
        toast.error('Failed to load datasets', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoadingDatasets(false);
      }
    };

    loadDatasets();
  }, []);

  // Load a dataset when selected
  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setIsLoading(true);
      setSelectedDatasetId(datasetId);
      
      // Get the selected dataset metadata
      const selectedDataset = availableDatasets.find(d => d.id === datasetId);
      
      if (!selectedDataset) {
        throw new Error('Dataset not found');
      }
      
      setUploadedFilename(selectedDataset.filename);
      
      // Set up header selections based on dataset
      const newSelectedColumns: Record<string, boolean> = {};
      selectedDataset.headers.forEach(header => {
        newSelectedColumns[header] = true;
      });
      setSelectedColumns(newSelectedColumns);
      
      // Fetch the full dataset data
      const result = await fetchDatasetById(datasetId);
      
      // Generate columns from the data
      if (result.data.length > 0) {
        const headers = Object.keys(result.data[0]);
        const dynamicColumns = generateColumns(headers);
        setDataColumns(dynamicColumns);
      }
      
      setDatasets(result.data);
    } catch (error) {
      toast.error('Failed to load dataset', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDataset = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteDataset(id);
      
      // Update the available datasets list
      setAvailableDatasets(prev => prev.filter(dataset => dataset.id !== id));
      
      // If the deleted dataset was selected, clear the selection
      if (selectedDatasetId === id) {
        setSelectedDatasetId(null);
        setDatasets([]);
        setUploadedFilename('');
      }
      
      toast.success('Dataset deleted successfully');
    } catch (error) {
      toast.error('Failed to delete dataset', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmId(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is a CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Invalid file type', {
        description: 'Please upload a CSV file',
      });
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Call server action to upload and process the CSV
      const result = await uploadCSV(formData);
      
      if (result.success && result.data) {
        // Generate dynamic columns from the first row's keys
        if (result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          const dynamicColumns = generateColumns(headers);
          setDataColumns(dynamicColumns);
          
          // Set up header selections
          const newSelectedColumns: Record<string, boolean> = {};
          headers.forEach(header => {
            newSelectedColumns[header] = true;
          });
          setSelectedColumns(newSelectedColumns);
        }
        
        setDatasets(result.data);
        setUploadedFilename(file.name);
        
        // Add the new dataset to the available datasets list
        if (result.dataset) {
          setAvailableDatasets(prev => [result.dataset as Dataset, ...prev]);
          setSelectedDatasetId(result.dataset.id);
        }
        
        toast.success('Upload successful', {
          description: `Uploaded ${file.name} with ${result.data.length} records`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      setIsError(true);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Failed to upload CSV',
      });
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Export dataset as CSV
  const handleExport = () => {
    if (!datasets.length) return;
    
    // Only include selected columns
    const selectedHeadersArray = Object.entries(selectedColumns)
      .filter(([, isSelected]) => isSelected)
      .map(([header]) => header);
    
    // Create CSV content
    const csvContent = [
      selectedHeadersArray.join(','),
      ...datasets.map(row => 
        selectedHeadersArray.map(header => {
          const value = row[header];
          // Handle values that need quotes (strings with commas, quotes, etc.)
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uploadedFilename || 'dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Datasets</h1>
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          <Button onClick={triggerFileInput} disabled={isLoading}>
            {isLoading ? (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Dataset Navigation */}
        <Card className="h-[calc(100vh-180px)] overflow-hidden flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Available Datasets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-grow">
            {isLoadingDatasets ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading datasets...</span>
              </div>
            ) : availableDatasets.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No datasets available</p>
                <p className="text-xs mt-1">Upload a CSV file to get started</p>
              </div>
            ) : (
              <div className="divide-y">
                {availableDatasets.map((dataset) => (
                  <div 
                    key={dataset.id}
                    className={`relative group ${
                      selectedDatasetId === dataset.id ? 'bg-muted' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleDatasetSelect(dataset.id)}
                      className="w-full text-left p-3 hover:bg-muted/50 flex items-start gap-3 transition-colors pr-10"
                    >
                      <FileSpreadsheet className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                      <div className="overflow-hidden">
                        <div className="font-medium truncate">{cleanFilename(dataset.filename)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {dataset.rowCount} rows • {dataset.headers.length} columns
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(dataset.uploadDate).toLocaleString()}
                        </div>
                      </div>
                    </button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(dataset.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Delete Dataset
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{cleanFilename(dataset.filename)}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteDataset(dataset.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="mt-auto border-t p-3">
            <Button 
              onClick={triggerFileInput} 
              variant="outline" 
              className="w-full"
              size="sm"
              disabled={isLoading}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Upload New Dataset
            </Button>
          </div>
        </Card>

        {/* Dataset Viewer */}
        <Card className="md:col-span-3 h-[calc(100vh-180px)] overflow-hidden flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dataset Viewer</CardTitle>
                <CardDescription>
                  {uploadedFilename 
                    ? `Currently viewing: ${cleanFilename(uploadedFilename)}`
                    : 'Select a dataset from the sidebar to view data'}
                </CardDescription>
              </div>
              {datasets.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          {datasets.length > 0 && selectedDatasetId && (
            <div className="border-b px-4 py-2 flex gap-2 overflow-auto">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium whitespace-nowrap">Columns:</span>
                {Object.keys(selectedColumns).map(header => (
                  <label
                    key={header}
                    className="flex items-center space-x-2 bg-muted/50 px-2 py-1 rounded text-sm cursor-pointer hover:bg-muted"
                  >
                    <Checkbox
                      id={`column-${header}`}
                      checked={selectedColumns[header]}
                      onCheckedChange={(checked) => {
                        setSelectedColumns(prev => ({
                          ...prev,
                          [header]: !!checked
                        }));
                      }}
                    />
                    <span>{header}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <CardContent className="p-4 overflow-auto flex-grow">
            {datasets.length === 0 && !isLoading && !isError ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No dataset selected</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Select a dataset from the sidebar or upload a new one
                </p>
                <Button variant="outline" onClick={triggerFileInput}>
                  Upload CSV
                </Button>
              </div>
            ) : (
              <DataTable
                columns={dataColumns.filter(col => 
                  // @ts-ignore
                  selectedColumns[col.accessorKey as string]
                )}
                data={datasets}
                isLoading={isLoading}
                isError={isError}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatasetsScreen;
