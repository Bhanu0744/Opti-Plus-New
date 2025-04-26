import { NextResponse } from 'next/server';
import { readFile, readdir, unlink } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

// Define the storage location for datasets
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'datasets');

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
    // List all files in the uploads directory
    const files = await readdir(UPLOAD_DIR);
    
    // Find the file that starts with the given ID
    const matchingFile = files.find(file => file.startsWith(id));
    
    if (!matchingFile) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const filePath = path.join(UPLOAD_DIR, matchingFile);
    const fileContent = await readFile(filePath, 'utf-8');
    
    // Parse the CSV file
    const { data, errors } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Error parsing CSV: ${errors[0].message}` 
        },
        { status: 400 }
      );
    }
    
    // Extract original filename from the stored filename
    const originalFilename = matchingFile.split('-').slice(1).join('-');
    
    // Get headers from first row
    const headers = Object.keys(data[0] || {});
    
    // Create dataset metadata
    const dataset = {
      id,
      filename: originalFilename,
      fullPath: matchingFile,
      uploadDate: new Date().toISOString(), // We don't have the actual upload date here
      headers,
      rowCount: data.length,
    };
    
    return NextResponse.json({
      success: true,
      data,
      dataset
    });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
    // List all files in the uploads directory
    const files = await readdir(UPLOAD_DIR);
    
    // Find the file that starts with the given ID
    const matchingFile = files.find(file => file.startsWith(id));
    
    if (!matchingFile) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Delete the file
    const filePath = path.join(UPLOAD_DIR, matchingFile);
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 