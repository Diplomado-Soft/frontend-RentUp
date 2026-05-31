import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { UserContext } from '../contexts/UserContext';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  BrowserRouter: ({ children }) => children,
}));

const defaultProps = {
  goToJoin: () => {},
  setShowAccount: () => {},
  listingSearch: '',
  setListingSearch: () => {},
  listingFilters: { priceMin: '', priceMax: '', bedrooms: [], bathrooms: [], amenities: [] },
  setListingFilters: () => {},
  notifications: [],
  unreadCount: 0,
  showNotifications: false,
  setShowNotifications: () => {},
  fetchNotifications: () => {},
  markNotificationRead: () => {},
  markAllRead: () => {},
  deleteNotification: () => {},
};

const renderWithUserContext = (ui, userValue = null) => {
  return render(
    <UserContext.Provider value={userValue || { user: null, login: jest.fn(), logout: jest.fn(), setUser: jest.fn() }}>
      {ui}
    </UserContext.Provider>
  );
};

describe('Navbar Component', () => {
  test('renders logo', () => {
    renderWithUserContext(<Navbar {...defaultProps} />);
    
    expect(screen.getByAltText('RentUP')).toBeInTheDocument();
  });

  test('renders login button when no user is logged in', () => {
    renderWithUserContext(<Navbar {...defaultProps} />);
    
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
  });
});