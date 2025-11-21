'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Button,
  TextField,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useTransactions, useDeleteTransaction, useUpdateTransaction } from '@/app/hooks/useTransactions';
import { useCategories } from '@/app/hooks/useCategories';
import TransactionDetailModal from '@/app/components/TransactionDetailModal';
import { Transaction, UpdateTransactionDto } from '@/lib/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();


  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((transaction) => {

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          transaction.category.toLowerCase().includes(searchLower) ||
          (transaction.description?.toLowerCase().includes(searchLower) ?? false);
        if (!matchesSearch) return false;
      }


      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }


      if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
        return false;
      }


      const transactionDate = new Date(transaction.date);
      if (startDate && transactionDate < startDate) {
        return false;
      }
      if (endDate && transactionDate > endDate) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  const handleRowClick = (params: GridRowParams) => {
    setSelectedTransaction(params.row as Transaction);
    setModalOpen(true);
  };

  const handleEdit = (transaction: Transaction, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleUpdate = async (data: UpdateTransactionDto) => {
    if (!editingTransaction) return;
    await updateMutation.mutateAsync({ id: editingTransaction.id, data });
    setEditModalOpen(false);
    setEditingTransaction(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'date',
        headerName: 'Date',
        width: 150,
        valueFormatter: (value) => format(new Date(value), 'MMM dd, yyyy'),
        sortable: true,
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 150,
        sortable: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 200,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.value || '-'}
          </Typography>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={params.value === 'income' ? 'success' : 'error'}
            size="small"
          />
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 130,
        sortable: true,
        valueFormatter: (value) => {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          return `$${isNaN(numValue) ? '0.00' : numValue.toFixed(2)}`;
        },
        renderCell: (params) => {
          const numValue = typeof params.value === 'string' ? parseFloat(params.value) : params.value;
          const amount = isNaN(numValue) ? 0 : numValue;
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: params.row.type === 'income' ? 'success.main' : 'error.main',
              }}
            >
              {params.row.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Box>
            <IconButton
              size="small"
              onClick={(e) => handleEdit(params.row as Transaction, e)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleDelete(params.row.id, e)}
              color="error"
              disabled={deleteMutation.isPending}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [deleteMutation.isPending]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('TransactionsPage: Error loading transactions', error);
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load transactions: {error instanceof Error ? error.message : 'Unknown error'}. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>


      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <TextField
            placeholder="Search by category or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
            <Button variant="outlined" color="secondary" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories?.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: 'small' } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
      </Typography>

      {!transactions || transactions.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No transactions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first transaction to get started
          </Typography>
        </Box>
      ) : filteredTransactions.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No transactions match your filters
          </Typography>
          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTransactions || []}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
                backgroundColor: 'action.hover',
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <TransactionDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={selectedTransaction}
      />


      <EditTransactionModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSave={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </Box>
  );
}


function EditTransactionModal({
  open,
  onClose,
  transaction,
  onSave,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (data: UpdateTransactionDto) => void;
  isLoading: boolean;
}) {
  const { data: categories } = useCategories();
  const [formData, setFormData] = useState<UpdateTransactionDto>({
    amount: 0,
    category: '',
    date: '',
    type: 'expense',
    description: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
        description: transaction.description || '',
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Transaction</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
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
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              inputProps={{ min: 0, step: 0.01 }}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories?.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  date: date ? date.toISOString().split('T')[0] : '',
                })
              }
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a note about this transaction..."
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
