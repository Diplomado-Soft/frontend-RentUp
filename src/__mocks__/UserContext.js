const React = require('react');

const mockUserValue = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  setUser: jest.fn(),
};

module.exports = {
  UserContext: React.createContext(mockUserValue),
  UserProvider: ({ children, value }) => {
    const contextValue = value || mockUserValue;
    return React.createElement('div', {}, children);
  },
};