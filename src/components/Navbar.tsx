import React from 'react';
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Container,
  Text
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <Box bg={bg} px={4} shadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={2} cursor="pointer" onClick={() => navigate('/')}>
            <Wallet size={24} />
            <Text fontSize="xl" fontWeight="bold">
              ExpenseTracker
            </Text>
          </Flex>

          {currentUser && (
            <Button onClick={handleLogout} variant="ghost">
              Logout
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;