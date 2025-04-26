'use client';

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define a basic type for dataset entries
// This will be dynamically enhanced based on CSV headers
export interface DatasetEntry {
  [key: string]: string | number | boolean | null;
}

// Function to generate columns dynamically from CSV headers
export function generateColumns(headers: string[]): ColumnDef<DatasetEntry>[] {
  return headers.map((header) => ({
    accessorKey: header,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 hover:bg-transparent"
        >
          {header}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(header);
      // Format the cell based on data type
      if (typeof value === 'number') {
        return <div className="text-right font-medium">{value.toLocaleString()}</div>;
      }
      return <div>{value?.toString() || ''}</div>;
    },
  }));
}

// Default empty columns to use until real data is loaded
export const columns: ColumnDef<DatasetEntry>[] = [
  {
    accessorKey: "column1",
    header: "Column 1",
  },
  {
    accessorKey: "column2",
    header: "Column 2",
  },
  {
    accessorKey: "column3",
    header: "Column 3",
  },
]; 