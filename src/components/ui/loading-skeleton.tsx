import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Loading skeleton for dashboard cards
export const DashboardCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

// Loading skeleton for report items
export const ReportItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// Loading skeleton for contact cards
export const ContactCardSkeleton: React.FC = () => (
  <Card className="p-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="mt-3 space-y-1">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
  </Card>
);

// Loading skeleton for appointment list
export const AppointmentSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

// Loading skeleton for task items
export const TaskSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
    <div className="flex items-start gap-3 flex-1">
      <Skeleton className="h-4 w-4 rounded mt-0.5" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// Loading skeleton for data tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-4 gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-20" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-16" />
        ))}
      </div>
    ))}
  </div>
);

// Loading skeleton for forms
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// Loading skeleton for page headers
export const PageHeaderSkeleton: React.FC = () => (
  <div className="flex items-center justify-between mb-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-10 w-28" />
  </div>
);

// Generic list skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4 flex-1">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);