'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import { Transaction } from '@/lib/api';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaction Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ${transaction.amount.toFixed(2)}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={transaction.type}
                color={transaction.type === 'income' ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {transaction.category}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {format(new Date(transaction.date), 'PPP')}
            </Typography>
          </Box>

          {transaction.description && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {transaction.description}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Transaction ID
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
              {transaction.id}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

