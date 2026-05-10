import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../pages/Signup';
import { UserContext } from '../contexts/UserContext';
import { signupUser } from '../apis/signupController';

const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockUseLocation = jest.fn(() => ({ state: {} }));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
  BrowserRouter: ({ children }) => children,
}));

jest.mock('../apis/signupController');
jest.mock('../apis/firebaseAuthService');

const renderSignup = () => {
  return render(
    <UserContext.Provider value={{ login: mockLogin, user: null, setUser: jest.fn() }}>
      <Signup />
    </UserContext.Provider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockUseLocation.mockReturnValue({ state: {} });
});

describe('Signup Component - Renderizado', () => {
  test('renderiza el titulo del formulario', () => {
    renderSignup();
    expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
  });

  test('renderiza inputs del formulario', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\(\+57\)/)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/)).toHaveLength(2);
  });

  test('renderiza boton de registro', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /registrarse ahora/i })).toBeInTheDocument();
  });

  test('renderiza boton de Google', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
  });

  test('renderiza link de inicio de sesion', () => {
    renderSignup();
    expect(screen.getByText(/inicia sesión aquí/i)).toBeInTheDocument();
  });

  test('renderiza selectores de tipo de usuario', () => {
    renderSignup();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Arrendador')).toBeInTheDocument();
  });

  test('renderiza boton de cerrar', () => {
    renderSignup();
    expect(screen.getByLabelText(/volver al inicio/i)).toBeInTheDocument();
  });
});

describe('Signup Component - Seleccion de rol', () => {
  test('selecciona tipo usuario al hacer clic', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByText('Usuario'));
    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
  });

  test('selecciona tipo arrendador al hacer clic', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByText('Arrendador'));
    expect(screen.getAllByText('Seleccionado')).toHaveLength(1);
  });

  test('recibe rol desde location state', () => {
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();
    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
  });
});

describe('Signup Component - Validacion de formulario', () => {
  test('muestra error si el telefono esta vacio', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText(/El número de teléfono es obligatorio/i)).toBeInTheDocument();
    });
  });

  test('muestra error si el telefono es muy corto', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ingresa un número de teléfono válido/i)).toBeInTheDocument();
    });
  });

  test('muestra error si las contrasenas no coinciden', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'different');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  test('muestra error si no se selecciona tipo de usuario', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecciona un tipo de usuario/i)).toBeInTheDocument();
    });
  });
});

describe('Signup Component - Envio exitoso', () => {
  test('llama a signupUser con datos correctos', async () => {
    signupUser.mockResolvedValue({ success: true, data: {} });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.type(screen.getByPlaceholderText('Tu nombre'), 'Juan');
    await user.type(screen.getByPlaceholderText('Tu apellido'), 'Perez');
    await user.type(screen.getByPlaceholderText(/correo@ejemplo.com/i), 'juan@test.com');
    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(signupUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Juan',
          apellido: 'Perez',
          email: 'juan@test.com',
          telefono: '3001234567',
          password: 'password123',
          rolId: 1,
        }),
        mockLogin
      );
    });
  });

  test('muestra modal de exito en registro exitoso', async () => {
    signupUser.mockResolvedValue({ success: true, data: {} });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registro Exitoso/i)).toBeInTheDocument();
    });
  });

  test('muestra mensaje de error en registro fallido', async () => {
    signupUser.mockResolvedValue({ success: false, message: 'El email ya está registrado' });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });

  test('usa rolId=2 para arrendador', async () => {
    signupUser.mockResolvedValue({ success: true, data: {} });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'arrendador' } });
    renderSignup();

    await user.type(screen.getByPlaceholderText(/\(\+57\)/), '3001234567');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordInputs[0], 'password123');
    await user.type(passwordInputs[1], 'password123');
    await user.click(screen.getByRole('button', { name: /registrarse ahora/i }));

    await waitFor(() => {
      expect(signupUser).toHaveBeenCalledWith(
        expect.objectContaining({ rolId: 2 }),
        expect.any(Function)
      );
    });
  });
});

describe('Signup Component - Google Sign-In', () => {
  test('muestra error si no hay tipo de usuario seleccionado', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecciona un tipo de usuario antes/i)).toBeInTheDocument();
    });
  });

  test('muestra modal de telefono para usuario nuevo de Google sin telefono', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      success: true,
      user: { email: 'test@gmail.com', nombre: 'Test', telefono: null, whatsapp: null },
      token: 'mock-token',
    });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(firebaseGoogleSignIn).toHaveBeenCalledWith(1);
      expect(screen.getByText(/completa tu registro/i)).toBeInTheDocument();
    });
  });

  test('navega a home para usuario de Google con telefono existente', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      success: true,
      user: { email: 'test@gmail.com', telefono: '3001234567', whatsapp: '3001234567' },
      token: 'mock-token',
    });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(firebaseGoogleSignIn).toHaveBeenCalledWith(1);
      expect(screen.getByText(/Registro Exitoso/i)).toBeInTheDocument();
    });
  });

  test('llama firebaseGoogleSignIn con rolId=2 para arrendador', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      success: true,
      user: { email: 'arrendador@gmail.com', telefono: '3001234567', whatsapp: '3001234567' },
      token: 'mock-token',
    });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'arrendador' } });
    renderSignup();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(firebaseGoogleSignIn).toHaveBeenCalledWith(2);
    });
  });

  test('muestra error si falla Google Sign-In en signup', async () => {
    const { firebaseGoogleSignIn } = require('../apis/firebaseAuthService');
    firebaseGoogleSignIn.mockResolvedValue({
      success: false,
      error: 'Error al autenticar con Google',
    });
    const user = userEvent.setup();
    mockUseLocation.mockReturnValue({ state: { role: 'usuario' } });
    renderSignup();

    await user.click(screen.getByRole('button', { name: /continuar con google/i }));

    await waitFor(() => {
      expect(firebaseGoogleSignIn).toHaveBeenCalledWith(1);
      expect(screen.getByText('Error al autenticar con Google')).toBeInTheDocument();
    });
  });
});

describe('Signup Component - Navegacion', () => {
  test('navega a login al hacer clic en inicia sesion', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByText(/inicia sesión aquí/i));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navega a home al hacer clic en cerrar', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByLabelText(/volver al inicio/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
