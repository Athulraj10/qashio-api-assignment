'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCreateTransaction } from '@/app/hooks/useTransactions';
import { useCategories } from '@/app/hooks/useCategories';
import { CreateTransactionDto } from '@/lib/api';

export default function NewTransactionPage() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateTransaction();

  const [formData, setFormData] = useState<CreateTransactionDto>({
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTransactionDto, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTransactionDto, string>> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      console.log('Creating transaction with data:', formData);
      const result = await createMutation.mutateAsync(formData);
      console.log('Transaction created successfully:', result);
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/transactions');
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleChange = (field: keyof CreateTransactionDto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = 'target' in e ? e.target.value : e;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value as string) || 0 : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split('T')[0],
      }));
      if (errors.date) {
        setErrors((prev) => ({ ...prev, date: undefined }));
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        New Transaction
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add a new income or expense transaction
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  handleChange('type')({ target: { value: e.target.value } })
                }
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={handleChange('amount')}
              error={!!errors.amount}
              helperText={errors.amount}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  handleChange('category')({ target: { value: e.target.value } })
                }
                disabled={categoriesLoading}
                required
              >
                {categoriesLoading ? (
                  <MenuItem disabled>Loading categories...</MenuItem>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No categories available</MenuItem>
                )}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <DatePicker
              label="Date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date,
                  required: true,
                },
              }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={handleChange('description')}
              placeholder="Add a note about this transaction (optional)..."
            />

            {createMutation.isError && (
              <Alert severity="error">
                Failed to create transaction. Please try again.
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/transactions')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || categoriesLoading}
                startIcon={
                  createMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : null
                }
              >
                {createMutation.isPending ? 'Creating...' : 'Create Transaction'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

