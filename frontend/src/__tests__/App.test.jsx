import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock axios early to avoid Jest ESM parsing issues with axios v1 ESM entry.
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  }),
}));

// Import after mocks
import App from '../App.jsx';

// Smoke test: render App at root route and verify Header brand text appears.
describe('App root component', () => {
  test('renders Header brand text SkillWise', () => {
    // App already contains BrowserRouter; render directly.
    render(<App />);

    // Header brand text (exact SkillWise, not Welcome to SkillWise)
    const brand = screen.getByRole('heading', { name: /^SkillWise$/i });
    expect(brand).toBeInTheDocument();
  });
});
