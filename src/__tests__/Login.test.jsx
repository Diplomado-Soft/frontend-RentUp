import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';
import { UserContext } from '../contexts/UserContext';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: {} }),
  BrowserRouter: ({ children }) => children,
}));

jest.mock('../apis/loginController', () => ({
  loginUser: jest.fn(),
}));

jest.mock('../apis/firebaseAuthService', () => ({
  firebaseGoogleSignIn: jest.fn(),
}));

const renderWithUserContext = (ui) => {
  return render(
    <UserContext.Provider value={{ login: jest.fn(), user: null, setUser: jest.fn() }}>
      {ui}
    </UserContext.Provider>
  );
};

describe('Login Component', () => {
  test('renders login form with email input', () => {
    renderWithUserContext(<Login />);
    
    expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeInTheDocument();
  });

  test('renders login form with password input', () => {
    renderWithUserContext(<Login />);
    
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    renderWithUserContext(<Login />);
    
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });

  test('renders Google sign in button', () => {
    renderWithUserContext(<Login />);
    
    expect(screen.getByText(/Continuar con Google/i)).toBeInTheDocument();
  });
});