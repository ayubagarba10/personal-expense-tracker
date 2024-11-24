import React, { useMemo } from 'react';
import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Expense } from '../hooks/useExpenses';

interface ExpenseStatsProps {
  expenses: Expense[];
}

const ExpenseStats: React.FC<ExpenseStatsProps> = ({ expenses }) => {
  const statBg = useColorModeValue('gray.50', 'gray.700');

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const today = new Date();
    const currentMonth = {
      start: startOfMonth(today),
      end: endOfMonth(today)
    };

    const thisMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, currentMonth);
    });
    
    const monthlyTotal = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyAvg = thisMonth.length ? monthlyTotal / thisMonth.length : 0;

    return { 
      total, 
      monthlyTotal, 
      monthlyAvg,
      currentMonthName: format(today, 'MMMM yyyy')
    };
  }, [expenses]);

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
      <Stat bg={statBg} p={4} rounded="md">
        <StatLabel>Total Expenses</StatLabel>
        <StatNumber>${stats.total.toFixed(2)}</StatNumber>
        <StatHelpText>All time</StatHelpText>
      </Stat>

      <Stat bg={statBg} p={4} rounded="md">
        <StatLabel>Monthly Expenses</StatLabel>
        <StatNumber>${stats.monthlyTotal.toFixed(2)}</StatNumber>
        <StatHelpText>{stats.currentMonthName}</StatHelpText>
      </Stat>

      <Stat bg={statBg} p={4} rounded="md">
        <StatLabel>Average Transaction</StatLabel>
        <StatNumber>${stats.monthlyAvg.toFixed(2)}</StatNumber>
        <StatHelpText>This month</StatHelpText>
      </Stat>
    </SimpleGrid>
  );
};

export default ExpenseStats;