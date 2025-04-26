import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import Papa from 'papaparse';

// Define the storage location for datasets
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'datasets');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' }, 
        { status: 400 }
      );
    }

    // Generate a unique filename
    const filename = `${randomUUID()}-${file.name}`;
    
    // Create upload directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Save the file to the server
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Parse the CSV file
    const csvText = buffer.toString();
    const { data, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
    });

    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error parsing CSV: ${errors[0].message}` 
        }, 
        { status: 400 }
      );
    }

    // Get headers from first row
    const headers = Object.keys(data[0] || {});

    // Store metadata about the dataset
    const datasetInfo = {
      id: filename.split('-')[0],
      filename: file.name,
      fullPath: filename,
      uploadDate: new Date().toISOString(),
      headers,
      rowCount: data.length,
    };

    // Return the parsed data
    return NextResponse.json({
      success: true,
      data,
      dataset: datasetInfo,
      filePath: `/uploads/datasets/${filename}`, // Public URL
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Ensure directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error ensuring dataset directory exists:', error);
    }

    // List all files in the uploads directory
    const files = await readdir(UPLOAD_DIR);
    
    // Filter for CSV files and get metadata for each
    const datasets = await Promise.all(
      files
        .filter(file => file.endsWith('.csv'))
        .map(async filename => {
          try {
            const filePath = path.join(UPLOAD_DIR, filename);
            const fileContent = await readFile(filePath, 'utf-8');
            const fileStats = await stat(filePath);
            
            // Parse the first few rows to get headers
            const { data, errors } = Papa.parse(fileContent, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
              preview: 5 // Just read a few rows to get headers
            });
            
            // Extract original filename from the stored filename
            const originalFilename = filename.split('-').slice(1).join('-');
            
            // If there are parsing errors, just return basic info
            if (errors.length > 0) {
              return {
                id: filename.split('-')[0],
                filename: originalFilename,
                fullPath: filename,
                uploadDate: fileStats.mtime.toISOString(),
                headers: [],
                rowCount: 0,
                error: errors[0].message
              };
            }
            
            // Get headers from first row
            const headers = Object.keys(data[0] || {});
            
            // Return dataset metadata
            return {
              id: filename.split('-')[0],
              filename: originalFilename,
              fullPath: filename,
              uploadDate: fileStats.mtime.toISOString(),
              headers,
              rowCount: data.length,
              previewData: data.slice(0, 3) // Include first 3 rows as preview
            };
          } catch (error) {
            console.error(`Error processing file ${filename}:`, error);
            return {
              id: filename.split('-')[0],
              filename: filename.split('-').slice(1).join('-'),
              fullPath: filename,
              error: 'Failed to process file'
            };
          }
        })
    );
    
    return NextResponse.json({
      success: true,
      datasets
    });
  } catch (error) {
    console.error('Error listing datasets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }, 
      { status: 500 }
    );
  }
} 