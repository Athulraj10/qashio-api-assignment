'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/app/hooks/useBudgets';
import { useCategories } from '@/app/hooks/useCategories';
import { BudgetWithSpending, CreateBudgetDto, UpdateBudgetDto, TimePeriod } from '@/lib/api';
import { format } from 'date-fns';

export default function BudgetsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);

  const { data: budgets, isLoading, error } = useBudgets(true);
  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleCreate = async (data: CreateBudgetDto) => {
    await createMutation.mutateAsync(data);
    setCreateModalOpen(false);
  };

  const handleEdit = (budget: BudgetWithSpending) => {
    setEditingBudget(budget);
    setEditModalOpen(true);
  };

  const handleUpdate = async (data: UpdateBudgetDto) => {
    if (!editingBudget) return;
    await updateMutation.mutateAsync({ id: editingBudget.id, data });
    setEditModalOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

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
        Failed to load budgets. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Budget
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track your spending against budgets for each category
      </Typography>

      {!budgets || budgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No budgets created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a budget to start tracking your spending
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Your First Budget
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {(budgets as BudgetWithSpending[]).map((budget) => {
            const percentage = budget.percentageUsed || 0;
            const isOverBudget = percentage >= 100;

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={budget.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {budget.category}
                        </Typography>
                        <Chip
                          label={budget.timePeriod}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(budget)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(budget.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Budget: ${budget.amount.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={isOverBudget ? 'error.main' : 'text.primary'}
                        >
                          {percentage.toFixed(1)}% Used
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        color={getProgressColor(percentage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Spent:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={isOverBudget ? 'error.main' : 'text.primary'}
                      >
                        ${budget.currentSpending.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={budget.remaining >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${Math.abs(budget.remaining).toFixed(2)}
                      </Typography>
                    </Box>

                    {budget.startDate && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Period: {format(new Date(budget.startDate), 'MMM dd, yyyy')}
                        {budget.endDate && ` - ${format(new Date(budget.endDate), 'MMM dd, yyyy')}`}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <CreateBudgetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
        categories={categories || []}
      />

      <EditBudgetModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingBudget(null);
        }}
        budget={editingBudget}
        onSave={handleUpdate}
        isLoading={updateMutation.isPending}
        categories={categories || []}
      />
    </Box>
  );
}

function CreateBudgetModal({
  open,
  onClose,
  onSave,
  isLoading,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateBudgetDto) => void;
  isLoading: boolean;
  categories: Array<{ id: string; name: string }>;
}) {
  const [formData, setFormData] = useState<CreateBudgetDto>({
    category: '',
    amount: 0,
    timePeriod: TimePeriod.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      category: '',
      amount: 0,
      timePeriod: TimePeriod.MONTHLY,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Budget</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              inputProps={{ min: 0, step: 0.01 }}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={formData.timePeriod}
                label="Time Period"
                onChange={(e) =>
                  setFormData({ ...formData, timePeriod: e.target.value as TimePeriod })
                }
              >
                <MenuItem value={TimePeriod.DAILY}>Daily</MenuItem>
                <MenuItem value={TimePeriod.WEEKLY}>Weekly</MenuItem>
                <MenuItem value={TimePeriod.MONTHLY}>Monthly</MenuItem>
                <MenuItem value={TimePeriod.YEARLY}>Yearly</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  startDate: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DatePicker
              label="End Date (Optional)"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  endDate: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Budget'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function EditBudgetModal({
  open,
  onClose,
  budget,
  onSave,
  isLoading,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  budget: BudgetWithSpending | null;
  onSave: (data: UpdateBudgetDto) => void;
  isLoading: boolean;
  categories: Array<{ id: string; name: string }>;
}) {
  const [formData, setFormData] = useState<UpdateBudgetDto>({
    category: '',
    amount: 0,
    timePeriod: TimePeriod.MONTHLY,
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        timePeriod: budget.timePeriod,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
    }
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!budget) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Budget</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              inputProps={{ min: 0, step: 0.01 }}
            />

            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={formData.timePeriod}
                label="Time Period"
                onChange={(e) =>
                  setFormData({ ...formData, timePeriod: e.target.value as TimePeriod })
                }
              >
                <MenuItem value={TimePeriod.DAILY}>Daily</MenuItem>
                <MenuItem value={TimePeriod.WEEKLY}>Weekly</MenuItem>
                <MenuItem value={TimePeriod.MONTHLY}>Monthly</MenuItem>
                <MenuItem value={TimePeriod.YEARLY}>Yearly</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  startDate: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DatePicker
              label="End Date (Optional)"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  endDate: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

