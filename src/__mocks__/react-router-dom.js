const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: undefined,
};

module.exports = {
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  BrowserRouter: ({ children }) => children,
  Link: ({ children, to }) => children,
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Navigate: ({ to }) => null,
  Outlet: () => null,
  useOutlet: () => null,
  HashRouter: ({ children }) => children,
  StaticRouter: ({ children }) => children,
  NavLink: ({ children, to }) => children,
};