import React from 'react';
import {
  Box,
  Grid,
  Heading,
  VStack,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseStats from '../components/ExpenseStats';
import ExpenseReport from '../components/ExpenseReport';
import { useExpenses } from '../hooks/useExpenses';

const Dashboard = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { expenses, loading, addExpense, deleteExpense } = useExpenses();

  return (
    <Grid
      templateColumns={{ base: '1fr', lg: '1fr 350px' }}
      gap={8}
    >
      <VStack spacing={8} align="stretch">
        <Box bg={bgColor} rounded="lg" p={6} shadow="sm">
          <Heading size="md" mb={6}>Expense Overview</Heading>
          <ExpenseStats expenses={expenses} />
        </Box>

        <Box bg={bgColor} rounded="lg" shadow="sm">
          <Tabs>
            <TabList px={6} pt={4}>
              <Tab>Recent Expenses</Tab>
              <Tab>Reports</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ExpenseList 
                  expenses={expenses} 
                  onDelete={deleteExpense}
                  isLoading={loading}
                />
              </TabPanel>
              <TabPanel>
                <ExpenseReport expenses={expenses} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      <Box>
        <Box bg={bgColor} rounded="lg" p={6} shadow="sm" position="sticky" top="24px">
          <Heading size="md" mb={6}>Add Expense</Heading>
          <ExpenseForm onSubmit={addExpense} />
        </Box>
      </Box>
    </Grid>
  );
};

export default Dashboard;