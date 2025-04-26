'use client';

import { DatasetEntry } from './columns';

// Dataset metadata type
export interface Dataset {
  id: string;
  filename: string;
  fullPath: string;
  uploadDate: string;
  headers: string[];
  rowCount: number;
  previewData?: DatasetEntry[];
  error?: string;
}

// Fetch all available datasets
export async function fetchDatasets(): Promise<Dataset[]> {
  try {
    const response = await fetch('/api/datasets');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch datasets');
    }
    
    return data.datasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
}

// Fetch a specific dataset by ID
export async function fetchDatasetById(id: string): Promise<{ data: DatasetEntry[], dataset: Dataset }> {
  try {
    const response = await fetch(`/api/datasets/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch dataset');
    }
    
    return {
      data: data.data,
      dataset: data.dataset
    };
  } catch (error) {
    console.error(`Error fetching dataset ${id}:`, error);
    throw error;
  }
}

// Delete a dataset by ID
export async function deleteDataset(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/datasets/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete dataset: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete dataset');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting dataset ${id}:`, error);
    throw error;
  }
}

// Function to parse a dataset file directly (useful for testing)
export async function parseDatasetFile(file: File): Promise<DatasetEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        
        if (!csv) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Use PapaParse in the browser environment
        const Papa = require('papaparse');
        const { data, errors } = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        
        if (errors.length > 0) {
          reject(new Error(`Error parsing CSV: ${errors[0].message}`));
          return;
        }
        
        resolve(data as DatasetEntry[]);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
} 