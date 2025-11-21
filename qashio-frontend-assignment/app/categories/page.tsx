'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useCategories, useCreateCategory } from '@/app/hooks/useCategories';
import { useTransactions } from '@/app/hooks/useTransactions';
import { CreateCategoryDto } from '@/lib/api';

export default function CategoriesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categories, isLoading, error } = useCategories();
  const { data: transactions } = useTransactions();
  const createMutation = useCreateCategory();

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    await createMutation.mutateAsync({ name: newCategoryName.trim() });
    setNewCategoryName('');
    setCreateModalOpen(false);
  };

  const categoryStats = categories?.map((category) => {
    const categoryTransactions = transactions?.filter(
      (t) => t.category === category.name
    ) || [];

    const totalIncome = categoryTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = categoryTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const transactionCount = categoryTransactions.length;

    return {
      ...category,
      totalIncome,
      totalExpenses,
      transactionCount,
      netAmount: totalIncome - totalExpenses,
    };
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load categories. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Category
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your transaction categories and view statistics
      </Typography>

      {!categories || categories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a category to organize your transactions
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Your First Category
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categoryStats?.map((category) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={category.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Transactions:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {category.transactionCount}
                      </Typography>
                    </Box>

                    {category.totalIncome > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Income:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          +${category.totalIncome.toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    {category.totalExpenses > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Expenses:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="error.main">
                          -${category.totalExpenses.toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    {category.transactionCount > 0 && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="bold">
                            Net:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={category.netAmount >= 0 ? 'success.main' : 'error.main'}
                          >
                            {category.netAmount >= 0 ? '+' : ''}${category.netAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newCategoryName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

