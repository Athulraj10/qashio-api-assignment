'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
  IconButton,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Add,
  ArrowForward,
  AttachMoney,
  Category,
  CalendarToday,
  ShowChart,
  Wallet,
  Savings,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useSummary } from '@/app/hooks/useSummary';
import { useTransactions } from '@/app/hooks/useTransactions';
import { useBudgets } from '@/app/hooks/useBudgets';
import { format } from 'date-fns';
import Link from 'next/link';

const COLORS = ['#003082', '#FFC917', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4'];

export default function Home() {
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year'>('month');

  const dateFilters = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        };
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: yearStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        };
      default:
        return undefined;
    }
  }, [dateRange]);

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useSummary(dateFilters);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: budgets } = useBudgets(true);

  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions]);

  const topCategories = useMemo(() => {
    if (!summary?.byCategory) return [];
    return summary.byCategory.slice(0, 5);
  }, [summary]);

  const budgetAlerts = useMemo(() => {
    if (!budgets) return [];
    return (budgets as any[]).filter((b: any) => b.percentageUsed >= 80).slice(0, 3);
  }, [budgets]);

  const avgTransactionAmount = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return total / transactions.length;
  }, [transactions]);

  const categoryExpensesByMonth = useMemo(() => {
    if (!transactions || !summary?.byCategory) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthData: Record<string, number> = {};
    const previousMonthData: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const date = new Date(t.date);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (month === currentMonth && year === currentYear) {
          currentMonthData[t.category] = (currentMonthData[t.category] || 0) + Number(t.amount);
        } else if (month === previousMonth && year === previousYear) {
          previousMonthData[t.category] = (previousMonthData[t.category] || 0) + Number(t.amount);
        }
      }
    });

    const allCategories = new Set([
      ...Object.keys(currentMonthData),
      ...Object.keys(previousMonthData),
      ...summary.byCategory.map((c) => c.category),
    ]);

    return Array.from(allCategories).map((category) => ({
      category,
      currentMonth: currentMonthData[category] || 0,
      previousMonth: previousMonthData[category] || 0,
      change: currentMonthData[category] && previousMonthData[category]
        ? ((currentMonthData[category] - previousMonthData[category]) / previousMonthData[category]) * 100
        : null,
    })).sort((a, b) => b.currentMonth - a.currentMonth);
  }, [transactions, summary]);

  const categoryTrends = useMemo(() => {
    if (!transactions) return [];

    const now = new Date();
    const months: Record<string, Record<string, number>> = {};

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = {};
    }

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[monthKey]) {
          months[monthKey][t.category] = (months[monthKey][t.category] || 0) + Number(t.amount);
        }
      }
    });

    const topCategories = summary?.byCategory.slice(0, 5).map((c) => c.category) || [];

    return Object.entries(months).map(([month, categories]) => {
      const data: any = { month };
      topCategories.forEach((cat) => {
        data[cat] = categories[cat] || 0;
      });
      return data;
    });
  }, [transactions, summary]);

  if (summaryLoading || transactionsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 500,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (summaryError) {
    console.error('Summary error:', summaryError);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load summary data: {summaryError instanceof Error ? summaryError.message : 'Unknown error'}. Please try again later.
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const balance = summary?.balance || 0;
  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <Box sx={{ pb: 4 }}>

      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '2.5rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Financial Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 400 }}>
              Welcome back! Here's your comprehensive financial overview
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant={dateRange === 'all' ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => setDateRange('all')}
              startIcon={<CalendarToday />}
              sx={{
                borderRadius: 2,
                px: 2.5,
                fontWeight: 600,
                ...(dateRange === 'all' && {
                  background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }),
              }}
            >
              All Time
            </Button>
            <Button
              variant={dateRange === 'year' ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => setDateRange('year')}
              sx={{
                borderRadius: 2,
                px: 2.5,
                fontWeight: 600,
                ...(dateRange === 'year' && {
                  background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }),
              }}
            >
              This Year
            </Button>
            <Button
              variant={dateRange === 'month' ? 'contained' : 'outlined'}
              size="medium"
              onClick={() => setDateRange('month')}
              sx={{
                borderRadius: 2,
                px: 2.5,
                fontWeight: 600,
                ...(dateRange === 'month' && {
                  background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }),
              }}
            >
              This Month
            </Button>
          </Box>
        </Box>


        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/transactions/new"
            variant="contained"
            size="large"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00215b 0%, #003082 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Add Transaction
          </Button>
          <Button
            component={Link}
            href="/budgets"
            variant="outlined"
            size="large"
            startIcon={<Wallet />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            Manage Budgets
          </Button>
          <Button
            component={Link}
            href="/categories"
            variant="outlined"
            size="large"
            startIcon={<Category />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            Categories
          </Button>
          <Button
            component={Link}
            href="/transactions"
            variant="outlined"
            size="large"
            startIcon={<Receipt />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            View All Transactions
          </Button>
        </Box>
      </Box>


      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #003082 0%, #00215b 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Balance
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    ${Math.abs(balance).toFixed(2)}
                  </Typography>
                  <Chip
                    label={balance >= 0 ? 'Positive' : 'Negative'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 64,
                    height: 64,
                  }}
                >
                  <AccountBalance sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #b28c10 0%, #FFC917 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Income
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    ${totalIncome.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {summary?.transactionCount ? `${Math.round((summary.transactionCount / 2) * 10) / 10} avg` : '0 avg'}
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 64,
                    height: 64,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {expenseRatio.toFixed(1)}% of income
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 64,
                    height: 64,
                  }}
                >
                  <TrendingDown sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #003082 0%, #33599b 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Transactions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {summary?.transactionCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    ${avgTransactionAmount.toFixed(2)} avg
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 64,
                    height: 64,
                  }}
                >
                  <Receipt sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {budgetAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', border: '1px solid #fecaca' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Savings sx={{ color: '#ef4444' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Budget Alerts
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {budgetAlerts.map((budget: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget.id}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {budget.category}
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {budget.percentageUsed.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentageUsed, 100)}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      ${budget.currentSpending.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 450, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Monthly Income vs Expenses
              </Typography>
              <ShowChart sx={{ color: 'primary.main' }} />
            </Box>
            {summary?.byMonth && summary.byMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={summary.byMonth}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC917" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FFC917" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => {
                      const [year, month] = label.split('-');
                      return `${month}/${year}`;
                    }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#FFC917"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 350, color: 'text.secondary' }}>
                <ShowChart sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1">No transaction data available</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Add transactions to see monthly trends</Typography>
              </Box>
            )}
          </Paper>
        </Grid>


        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 450, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Expenses by Category
              </Typography>
              <Category sx={{ color: 'primary.main' }} />
            </Box>
            {summary?.byCategory && summary.byCategory.length > 0 ? (
              <Box>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={summary.byCategory.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {summary.byCategory.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {summary.byCategory.slice(0, 4).map((item, index) => (
                    <Box key={item.category} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {item.category}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${item.total.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography color="text.secondary">No category data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>


      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Category Expenses: Current vs Previous Month
              </Typography>
              <Category sx={{ color: 'primary.main' }} />
            </Box>
            {categoryExpensesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryExpensesByMonth.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="currentMonth" fill="#ef4444" name="Current Month" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="previousMonth" fill="#94a3b8" name="Previous Month" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <Typography color="text.secondary">No category data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>


      {categoryTrends.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Categories Trend (Last 6 Months)
                </Typography>
                <ShowChart sx={{ color: 'primary.main' }} />
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => {
                      const [year, month] = label.split('-');
                      return `${month}/${year}`;
                    }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  {summary?.byCategory.slice(0, 5).map((cat, index) => (
                    <Line
                      key={cat.category}
                      type="monotone"
                      dataKey={cat.category}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}


      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detailed Category Breakdown
              </Typography>
              <AttachMoney sx={{ color: 'primary.main' }} />
            </Box>
            {categoryExpensesByMonth.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'table', width: '100%' }}>
                  <Box sx={{ display: 'table-row', bgcolor: 'grey.100', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'table-cell', p: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
                      Category
                    </Box>
                    <Box sx={{ display: 'table-cell', p: 2, borderBottom: '2px solid', borderColor: 'divider', textAlign: 'right' }}>
                      Current Month
                    </Box>
                    <Box sx={{ display: 'table-cell', p: 2, borderBottom: '2px solid', borderColor: 'divider', textAlign: 'right' }}>
                      Previous Month
                    </Box>
                    <Box sx={{ display: 'table-cell', p: 2, borderBottom: '2px solid', borderColor: 'divider', textAlign: 'right' }}>
                      Change
                    </Box>
                  </Box>
                  {categoryExpensesByMonth.map((item, index) => (
                    <Box
                      key={item.category}
                      sx={{
                        display: 'table-row',
                        bgcolor: index % 2 === 0 ? 'white' : 'grey.50',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS[index % COLORS.length],
                            }}
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {item.category}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight="bold" color="error.main">
                          ${item.currentMonth.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
                        <Typography variant="body1" color="text.secondary">
                          ${item.previousMonth.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'right' }}>
                        {item.change !== null ? (
                          <Chip
                            label={`${item.change >= 0 ? '+' : ''}${item.change.toFixed(1)}%`}
                            size="small"
                            color={item.change >= 0 ? 'error' : 'success'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No category data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Top Spending Categories
              </Typography>
              <Button component={Link} href="/transactions" size="small" endIcon={<ArrowForward />}>
                View All
              </Button>
            </Box>
            {topCategories.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {topCategories.map((item, index) => (
                  <Box
                    key={item.category}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: index === 0 ? 'primary.50' : 'grey.50',
                      border: index === 0 ? '2px solid' : '1px solid',
                      borderColor: index === 0 ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: COLORS[index % COLORS.length],
                        width: 48,
                        height: 48,
                        fontWeight: 'bold',
                      }}
                    >
                      #{index + 1}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.count} transactions
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        ${item.total.toFixed(2)}
                      </Typography>
                      {totalExpenses > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {((item.total / totalExpenses) * 100).toFixed(1)}%
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No category data available
              </Typography>
            )}
          </Paper>
        </Grid>


        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Button component={Link} href="/transactions" size="small" endIcon={<ArrowForward />}>
                View All
              </Button>
            </Box>
            {recentTransactions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentTransactions.map((transaction, index) => (
                  <Box
                    key={transaction.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp sx={{ fontSize: 20 }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 20 }} />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {transaction.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary" variant="body1" gutterBottom>
                  No recent transactions
                </Typography>
                <Button
                  component={Link}
                  href="/transactions/new"
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ mt: 2 }}
                >
                  Add Your First Transaction
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
