'use client';

import React, { Suspense } from 'react';
import DatasetsScreen from '@/components/modules/datasets/datasets-screen';

export default function DatasetsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <DatasetsScreen />
    </Suspense>
  );
} 