import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, List, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { expenseApi } from '@/integrations/supabase/expenseApi';
import { format, differenceInCalendarDays } from 'date-fns';

interface ExpenseAnalyticsProps {
  dateRange: { from: Date; to: Date };
}

export function ExpenseAnalytics({ dateRange }: ExpenseAnalyticsProps) {
  const [
    analytics,
    setAnalytics,
  ] = useState<{
    totalAmount: number;
    totalCount: number;
    categoryTotals: { category: string; amount: number }[];
    monthlyData: { month: string; amount: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await expenseApi.getExpenseAnalytics(
        format(dateRange.from, 'yyyy-MM-dd'),
        format(dateRange.to, 'yyyy-MM-dd')
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading expense analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const expenses = await expenseApi.listExpenses(
        format(dateRange.from, 'yyyy-MM-dd'),
        format(dateRange.to, 'yyyy-MM-dd')
      );

      const csvHeaders = ['Date', 'Category', 'Description', 'Amount'];
      const csvRows = expenses.map((exp) => [
        format(new Date(exp.expense_date), 'MM/dd/yyyy'),
        exp.category || 'Uncategorized',
        exp.description || '',
        exp.amount.toFixed(2),
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(
        dateRange.to,
        'yyyy-MM-dd'
      )}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">
            No expense data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  const dayCount = Math.max(
    1,
    differenceInCalendarDays(dateRange.to, dateRange.from) + 1
  );
  const averagePerDay = analytics.totalAmount / dayCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spend
                </p>
                <p className="text-2xl font-bold">
                  ${analytics.totalAmount.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average per Day
                </p>
                <p className="text-2xl font-bold">
                  ${averagePerDay.toFixed(2)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Entries
                </p>
                <p className="text-2xl font-bold">{analytics.totalCount}</p>
              </div>
              <List className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {(analytics.monthlyData.length > 0 ||
        analytics.categoryTotals.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spend Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {analytics.categoryTotals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.categoryTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      name="Amount"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseAnalytics;

