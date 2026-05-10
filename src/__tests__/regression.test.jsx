import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { UserContext } from '../contexts/UserContext';

beforeEach(() => {
  localStorage.clear();
});

describe('Regresion: UserContext', () => {
  test('login guarda usuario en localStorage con token', async () => {
    const { UserProvider } = require('../contexts/UserContext');
    const testUser = { id: 1, email: 'test@test.com', nombre: 'Test', token: 'abc123' };

    const TestComponent = () => {
      const ctx = React.useContext(UserContext);
      React.useEffect(() => { ctx.login(testUser); }, []);
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser.email).toBe('test@test.com');
      expect(localStorage.getItem('token')).toBe('abc123');
    });
  });

  test('logout limpia localStorage', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com' }));
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('selectedRole', 'usuario');

    const { UserProvider } = require('../contexts/UserContext');

    const TestComponent = () => {
      const ctx = React.useContext(UserContext);
      React.useEffect(() => { ctx.logout(); }, []);
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('selectedRole')).toBeNull();
    });
  });

  test('usuario persiste entre renderizados', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', token: 'abc123' }));

    const { UserProvider } = require('../contexts/UserContext');

    let capturedUser;
    const TestComponent = () => {
      const ctx = React.useContext(UserContext);
      capturedUser = ctx.user;
      return null;
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(capturedUser.email).toBe('test@test.com');
  });
});
