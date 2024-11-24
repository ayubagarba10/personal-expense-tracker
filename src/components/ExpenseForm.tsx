import React, { useState, useCallback } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  Textarea,
  FormErrorMessage,
} from '@chakra-ui/react';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../hooks/useExpenses';

interface ExpenseFormProps {
  onSubmit: (expense: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
  }) => Promise<void>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, category, date]);

  const resetForm = useCallback(() => {
    setAmount('');
    setCategory('Other');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        amount: parseFloat(amount),
        category,
        description,
        date,
      });
      
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Expense added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add expense',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.amount}>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <FormErrorMessage>{errors.amount}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.category}>
          <FormLabel>Category</FormLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.category}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            resize="vertical"
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.date}>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <FormErrorMessage>{errors.date}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          w="100%"
          isLoading={loading}
          loadingText="Adding expense..."
        >
          Add Expense
        </Button>
      </VStack>
    </form>
  );
};

export default ExpenseForm;