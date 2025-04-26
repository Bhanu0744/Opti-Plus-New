'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileSpreadsheet, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { fetchDatasetById, Dataset } from '@/components/modules/datasets/dataset-controller';
import { DataTable } from '@/components/modules/datasets/data-table';
import { DatasetEntry, generateColumns } from '@/components/modules/datasets/columns';
import { Button } from '@/components/ui/button';

export default function DatasetPage({ params }: { params: { id: string } }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [data, setData] = useState<DatasetEntry[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadDataset() {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const result = await fetchDatasetById(params.id);
        
        setDataset(result.dataset);
        setData(result.data);
        
        if (result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          setColumns(generateColumns(headers));
        }
      } catch (error) {
        setIsError(true);
        toast.error('Failed to load dataset', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDataset();
  }, [params.id]);

  // Function to export the dataset as a CSV
  const handleExport = () => {
    if (!dataset || !data.length) return;
    
    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
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
    link.setAttribute('download', dataset.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileSpreadsheet className="mr-3 h-7 w-7" />
            {isLoading ? 'Loading dataset...' : dataset?.filename || 'Dataset'}
          </h1>
          {dataset && (
            <p className="text-muted-foreground mt-1">
              {dataset.rowCount} rows • {dataset.headers.length} columns • Uploaded on {new Date(dataset.uploadDate).toLocaleString()}
            </p>
          )}
        </div>
        
        {dataset && data.length > 0 && (
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Card className="h-[calc(100vh-180px)] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dataset Viewer</CardTitle>
              <CardDescription>
                {dataset ? `Viewing data from ${dataset.filename}` : 'Loading dataset...'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-auto flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Loading dataset...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-lg font-medium">Failed to load dataset</h3>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error loading this dataset. Please try again or select another dataset.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/datasets'}>
                Back to Datasets
              </Button>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No data available</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This dataset appears to be empty or couldn't be parsed properly.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/datasets'}>
                Back to Datasets
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              isLoading={isLoading}
              isError={isError}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 