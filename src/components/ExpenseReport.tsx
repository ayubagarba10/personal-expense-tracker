import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Select,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  startOfWeek, 
  endOfWeek, 
  format, 
  subDays, 
  subMonths, 
  subYears,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Expense } from '../hooks/useExpenses';

interface ExpenseReportProps {
  expenses: Expense[];
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ExpenseReport: React.FC<ExpenseReportProps> = ({ expenses }) => {
  const [period, setPeriod] = useState<Period>('monthly');
  const chartColor = useColorModeValue('brand.500', 'brand.200');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { filteredData, chartData, dateRange, periodExpenses } = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let intervals: Date[];

    // Determine date range and intervals based on period
    switch (period) {
      case 'daily':
        startDate = subDays(today, 7);
        intervals = eachDayOfInterval({ start: startDate, end: today });
        break;
      case 'weekly':
        startDate = subMonths(today, 3); // Show last 3 months of weekly data
        intervals = eachWeekOfInterval({ start: startDate, end: today });
        break;
      case 'monthly':
        startDate = subMonths(today, 12);
        intervals = eachMonthOfInterval({ start: startDate, end: today });
        break;
      case 'yearly':
        startDate = subYears(today, 5);
        intervals = eachMonthOfInterval({ start: startDate, end: today })
          .filter(date => date.getMonth() === 0);
        break;
      default:
        startDate = subMonths(today, 12);
        intervals = eachMonthOfInterval({ start: startDate, end: today });
    }

    // Filter expenses within date range
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= startDate && expenseDate <= today;
    });

    // Create chart data with all intervals
    const data = intervals.map(intervalStart => {
      let intervalEnd: Date;
      let labelFormat: string;

      switch (period) {
        case 'daily':
          intervalEnd = intervalStart;
          labelFormat = 'MMM d';
          break;
        case 'weekly':
          intervalEnd = endOfWeek(intervalStart);
          labelFormat = "'W'w MMM";
          break;
        case 'monthly':
          intervalEnd = endOfMonth(intervalStart);
          labelFormat = 'MMM yyyy';
          break;
        case 'yearly':
          intervalEnd = endOfMonth(intervalStart);
          labelFormat = 'yyyy';
          break;
        default:
          intervalEnd = endOfMonth(intervalStart);
          labelFormat = 'MMM yyyy';
      }

      const periodExpenses = filteredExpenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, {
          start: intervalStart,
          end: intervalEnd
        });
      });

      const total = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        date: format(intervalStart, labelFormat),
        amount: total,
        expenses: periodExpenses,
        _raw: { start: intervalStart, end: intervalEnd }
      };
    });

    // Get expenses for the selected period
    const currentPeriodExpenses = data.reduce((acc, item) => [...acc, ...item.expenses], [] as Expense[]);

    return {
      filteredData: filteredExpenses,
      chartData: data,
      dateRange: { start: startDate, end: today },
      periodExpenses: currentPeriodExpenses
    };
  }, [expenses, period]);

  const categoryTotals = useMemo(() => {
    return periodExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [periodExpenses]);

  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    const exportData = filteredData.map(expense => ({
      Date: format(parseISO(expense.date), 'MM/dd/yyyy'),
      Amount: expense.amount.toFixed(2),
      Category: expense.category,
      Description: expense.description || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    const filename = `expense-report-${period}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  if (expenses.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No expenses recorded yet. Add some expenses to see your reports.
      </Alert>
    );
  }

  const totalAmount = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgAmount = periodExpenses.length > 0 ? totalAmount / periodExpenses.length : 0;

  return (
    <VStack spacing={6} w="100%" align="stretch">
      <HStack justify="space-between">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          w="200px"
          bg={bgColor}
        >
          <option value="daily">Last 7 Days</option>
          <option value="weekly">Last 3 Months (Weekly)</option>
          <option value="monthly">Last 12 Months</option>
          <option value="yearly">Last 5 Years</option>
        </Select>
        <Button
          leftIcon={<Download size={16} />}
          onClick={exportToExcel}
          size="sm"
          isDisabled={filteredData.length === 0}
        >
          Export
        </Button>
      </HStack>

      <Box bg={bgColor} p={6} rounded="lg" shadow="sm">
        <Heading size="sm" mb={4}>Expense Trend</Heading>
        {chartData.length > 0 ? (
          <Box h="300px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 'weekly' ? 1 : 0}
                  angle={period === 'weekly' ? -45 : 0}
                  textAnchor={period === 'weekly' ? 'end' : 'middle'}
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ background: bgColor, border: `1px solid ${borderColor}` }}
                />
                <Bar dataKey="amount" fill={chartColor} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No expenses found for the selected period.
          </Alert>
        )}
      </Box>

      <Box bg={bgColor} p={6} rounded="lg" shadow="sm">
        <Heading size="sm" mb={4}>Summary</Heading>
        <VStack align="stretch" spacing={4}>
          <Text>Period: {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}</Text>
          <HStack justify="space-between">
            <Text>Total Expenses:</Text>
            <Text fontWeight="bold">${totalAmount.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Average Transaction:</Text>
            <Text fontWeight="bold">${avgAmount.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Number of Transactions:</Text>
            <Text fontWeight="bold">{periodExpenses.length}</Text>
          </HStack>
          
          <Divider />
          
          <Heading size="sm" mb={2}>Category Breakdown</Heading>
          <VStack align="stretch" spacing={2}>
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => (
                <HStack key={category} justify="space-between">
                  <Badge colorScheme="brand">{category}</Badge>
                  <Text>${total.toFixed(2)}</Text>
                </HStack>
              ))}
          </VStack>
        </VStack>
      </Box>

      <Box bg={bgColor} p={6} rounded="lg" shadow="sm">
        <Heading size="sm" mb={4}>Transactions</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Category</Th>
              <Th>Description</Th>
              <Th isNumeric>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {periodExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <Tr key={expense.id}>
                  <Td>{format(parseISO(expense.date), 'MMM d, yyyy')}</Td>
                  <Td>
                    <Badge colorScheme="brand">{expense.category}</Badge>
                  </Td>
                  <Td>{expense.description || '-'}</Td>
                  <Td isNumeric>${expense.amount.toFixed(2)}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default ExpenseReport;