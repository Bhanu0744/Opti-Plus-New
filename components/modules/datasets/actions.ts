'use server';

import { DatasetEntry } from './columns';
import { Dataset } from './dataset-controller';

// Type for the response of the uploadCSV action
type UploadCSVResponse = {
  success: boolean;
  data?: DatasetEntry[];
  error?: string;
  filePath?: string;
  dataset?: Dataset;
};

/**
 * Server action to handle CSV file uploads
 * Uses the server-side API directly instead of fetch for better reliability
 */
export async function uploadCSV(formData: FormData): Promise<UploadCSVResponse> {
  try {
    // Check if file exists in formData
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Instead of using fetch, let's directly use the API implementation
    // This avoids URL resolution issues in server actions
    
    // Read file data
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Import the necessary modules
    const { randomUUID } = await import('crypto');
    const path = await import('path');
    const { writeFile, mkdir } = await import('fs/promises');
    const Papa = await import('papaparse');
    
    // Define the storage location for datasets
    const UPLOAD_DIR = path.default.join(process.cwd(), 'public', 'uploads', 'datasets');
    
    // Generate a unique filename
    const id = randomUUID();
    const filename = `${id}-${file.name}`;
    
    // Create upload directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    // Save the file to the server
    const filePath = path.default.join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);
    
    // Parse the CSV file
    const csvText = buffer.toString();
    const { data, errors } = Papa.default.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
    });
    
    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
      return { 
        success: false, 
        error: `Error parsing CSV: ${errors[0].message}`,
      };
    }
    
    // Get headers from the data
    const headers = Object.keys(data[0] || {});
    
    // Create dataset metadata
    const dataset: Dataset = {
      id,
      filename: file.name,
      fullPath: filename,
      uploadDate: new Date().toISOString(),
      headers,
      rowCount: data.length,
    };
    
    // Return the parsed data
    return {
      success: true,
      data: data as DatasetEntry[],
      dataset,
      filePath: `/uploads/datasets/${filename}`, // Public URL
    };
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 