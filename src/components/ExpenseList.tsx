import React from 'react';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Skeleton,
  Box,
  Heading,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Expense } from '../hooks/useExpenses';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, isLoading }) => {
  // Sort expenses by date in descending order
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <VStack align="stretch" spacing={4}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="60px" />
        ))}
      </VStack>
    );
  }

  if (expenses.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" p={4}>
        No expenses recorded yet.
      </Text>
    );
  }

  // Group expenses by date
  const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
    const date = format(new Date(expense.date), 'MMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  return (
    <VStack align="stretch" spacing={6}>
      {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
        <Box key={date}>
          <Heading size="sm" mb={3} color="gray.600" _dark={{ color: 'gray.400' }}>
            {date}
          </Heading>
          <VStack align="stretch" spacing={3}>
            {dateExpenses.map((expense) => (
              <HStack
                key={expense.id}
                justify="space-between"
                p={4}
                bg="gray.50"
                _dark={{ bg: 'gray.700' }}
                rounded="md"
              >
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Badge colorScheme="brand">{expense.category}</Badge>
                  </HStack>
                  {expense.description && (
                    <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                      {expense.description}
                    </Text>
                  )}
                </VStack>
                <HStack>
                  <Text fontWeight="bold">
                    ${expense.amount.toFixed(2)}
                  </Text>
                  <IconButton
                    aria-label="Delete expense"
                    icon={<Trash2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete(expense.id)}
                  />
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

export default ExpenseList;