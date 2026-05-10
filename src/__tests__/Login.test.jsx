import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';
import { UserContext } from '../contexts/UserContext';
import { loginUser } from '../apis/loginController';

const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockUseLocation = jest.fn(() => ({ state: {} }));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
  BrowserRouter: ({ children }) => children,
}));

jest.mock('../apis/loginController');
jest.mock('../apis/firebaseAuthService');

const mockAxiosPost = jest.fn().mockResolvedValue({
  data: { success: true, user: { id: 1, email: 'test@gmail.com', nombre: 'Test', rol: 'arrendador' }, token: 'mock-jwt' }
});

jest.mock('../contexts/axiosInstance', () => ({
  __esModule: true,
  default: { post: (...args) => mockAxiosPost(...args) },
}));

const mockGetIdToken = jest.fn().mockResolvedValue('mock-firebase-token');

jest.mock('../firebaseConfig', () => ({
  __esModule: true,
  auth: {
    currentUser: {
      getIdToken: (...args) => mockGetIdToken(...args),
    },
  },
  googleProvider: {},
}));

const renderLogin = () => {
  return render(
    <UserContext.Provider value={{ login: mockLogin, user: null, setUser: jest.fn() }}>
      <Login />
    </UserContext.Provider>
  );
};

const mockCurrentUser = { getIdToken: (...args) => mockGetIdToken(...args) };

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockUseLocation.mockReturnValue({ state: {} });
  const fbMock = jest.requireMock('../firebaseConfig');
  fbMock.auth.currentUser = mockCurrentUser;
});

describe('Login Component - Renderizado', () => {
  test('renderiza input de email', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeInTheDocument();
  });

  test('renderiza input de password', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
  });

  test('renderiza boton de submit', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('renderiza boton de Google', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
  });

  test('renderiza link de registro', () => {
    renderLogin();
    expect(screen.getByText(/regístrate aquí/i)).toBeInTheDocument();
  });

  test('renderiza link de olvide contraseña', () => {
    renderLogin();
    expect(screen.getByText(/¿olvidaste tu contraseña/i)).toBeInTheDocument();
  });

  test('renderiza boton de cerrar', () => {
    renderLogin();
    expect(screen.getByLabelText(/volver al inicio/i)).toBeInTheDocument();
  });
});

describe('Login Component - Envio de formulario', () => {
  test('llama a loginUser al hacer submit', async () => {
    loginUser.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText(/correo@ejemplo.com/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        login: mockLogin,
      });
    });
  });

  test('navega a home en login exitoso', async () => {
    loginUser.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText(/correo@ejemplo.com/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('muestra mensaje de error en login fallido', async () => {
    loginUser.mockResolvedValue({ success: false, message: 'Credenciales inválidas' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText(/correo@ejemplo.com/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'wrong');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  test('maneja pendingPropertyId en login exitoso', async () => {
    localStorage.setItem('pendingPropertyId', '123');
    localStorage.setItem('pendingPropertyTitle', 'Test Property');
    loginUser.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText(/correo@ejemplo.com/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(localStorage.getItem('openPropertyModal')).toBe('123');
      expect(localStorage.getItem('pendingPropertyId')).toBeNull();
    });
  });
});

describe('Login Component - Google Sign-In', () => {
  test('muestra modal de rol para usuario nuevo de Google', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      requiresRoleSelection: true,
      user: { email: 'test@gmail.com', nombre: 'Test' },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecciona tu tipo de cuenta/i)).toBeInTheDocument();
    });
  });

  test('loguea directamente si el usuario de Google ya tiene rol', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      requiresRoleSelection: false,
      user: { email: 'test@gmail.com', rol: 'usuario' },
      token: 'mock-token',
    });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@gmail.com', token: 'mock-token' })
      );
    });
  });

  test('muestra error si falla el Google Sign-In', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockRejectedValue(new Error('Error de autenticación'));
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(screen.getByText('Error de autenticación')).toBeInTheDocument();
    });
  });

  test('selecciona rol en el modal y completa login exitosamente', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      requiresRoleSelection: true,
      user: { email: 'test@gmail.com', nombre: 'Test' },
    });
    mockAxiosPost.mockResolvedValue({
      data: { success: true, user: { id: 1, email: 'test@gmail.com', nombre: 'Test', rol: 'arrendador' }, token: 'mock-jwt' }
    });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecciona tu tipo de cuenta/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText('Arrendador'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@gmail.com', rol: 'arrendador', token: 'mock-jwt' })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

describe('Login Component - Navegacion', () => {
  test('navega a signup al hacer clic en registrate', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText(/regístrate aquí/i));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  test('navega a forgot-password al hacer clic en el link', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByText(/¿olvidaste tu contraseña/i));
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  test('navega a home al hacer clic en boton cerrar', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByLabelText(/volver al inicio/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('Login Component - Manejo de errores', () => {
  test('muestra error desde location state', () => {
    mockUseLocation.mockReturnValue({ state: { errorMsg: 'Debes iniciar sesión primero' } });

    renderLogin();

    expect(screen.getByText('Debes iniciar sesión primero')).toBeInTheDocument();
  });

  test('muestra error si no hay firebase currentUser en role select', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      requiresRoleSelection: true,
      user: { email: 'test@gmail.com', nombre: 'Test' },
    });

    const firebaseConfig = jest.requireMock('../firebaseConfig');
    firebaseConfig.auth.currentUser = null;

    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecciona tu tipo de cuenta/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText('Arrendador'));

    await waitFor(() => {
      expect(screen.getByText('Sesion de Google no disponible')).toBeInTheDocument();
    });
  });
});
