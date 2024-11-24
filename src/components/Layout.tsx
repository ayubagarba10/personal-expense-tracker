import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  useColorMode,
  Container
} from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';
import Navbar from './Navbar';

const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bg}>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <Flex justify="flex-end" mb={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            onClick={toggleColorMode}
            size="md"
            variant="ghost"
          />
        </Flex>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;