import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { UserContext } from '../contexts/UserContext';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }) => children,
}));

const renderWithUserContext = (ui, userValue = null) => {
  return render(
    <UserContext.Provider value={userValue || { user: null, login: jest.fn(), logout: jest.fn(), setUser: jest.fn() }}>
      {ui}
    </UserContext.Provider>
  );
};

describe('Navbar Component', () => {
  test('renders logo and title', () => {
    renderWithUserContext(<Navbar goToJoin={() => {}} setShowAccount={() => {}} />);
    
    expect(screen.getByText('RentUp')).toBeInTheDocument();
  });

  test('renders login button when no user is logged in', () => {
    renderWithUserContext(<Navbar goToJoin={() => {}} setShowAccount={() => {}} />);
    
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });
});