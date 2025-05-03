import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthContext } from '../../src/context/AuthContext'; // Make sure this import is correct
import { FavoriteContext } from '../../src/context/FavoriteContext'; // Make sure this import is correct
import CountryCard from '../../src/components/CountryCard';

// Mock contexts
const mockAuthContext = {
  user: { id: '123', name: 'Test User' }
};

const mockFavoriteContext = {
  isFavorite: jest.fn().mockReturnValue(false),
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn()
};

const mockUnauthContext = {
  user: null
};

const mockCountry = {
  cca3: 'USA',
  name: { common: 'United States' },
  flags: { svg: 'https://flagcdn.com/us.svg' },
  population: 331002651,
  region: 'Americas',
  capital: ['Washington D.C.']
};

const theme = createTheme();

const renderWithContexts = (country, authContext, favoriteContext) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={authContext}>
          <FavoriteContext.Provider value={favoriteContext}>
            <CountryCard country={country} />
          </FavoriteContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('CountryCard Component', () => {
  it('renders country information correctly', () => {
    renderWithContexts(mockCountry, mockAuthContext, mockFavoriteContext);
    
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Population: 331,002,651')).toBeInTheDocument();
    expect(screen.getByText('Region: Americas')).toBeInTheDocument();
    expect(screen.getByText('Capital: Washington D.C.')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Flag of United States');
  });

  it('navigates to country details when clicked', () => {
    renderWithContexts(mockCountry, mockAuthContext, mockFavoriteContext);
    
    const card = screen.getByRole('button', { name: /united states/i });
    fireEvent.click(card);
    
    // Make sure you mock the correct behavior for the navigation to `/country/USA`
    expect(window.location.pathname).toBe('/country/USA');
  });

  it('shows favorite icon when user is logged in', () => {
    renderWithContexts(mockCountry, mockAuthContext, mockFavoriteContext);
    
    expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
  });

  it('does not show favorite icon when user is not logged in', () => {
    renderWithContexts(mockCountry, mockUnauthContext, mockFavoriteContext);
    
    expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
  });

  it('adds favorite when clicked and not favorited', () => {
    renderWithContexts(mockCountry, mockAuthContext, mockFavoriteContext);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(mockFavoriteContext.addToFavorites).toHaveBeenCalledWith('USA');
  });

  it('removes favorite if already favorited', () => {
    const favoritedContext = {
      ...mockFavoriteContext,
      isFavorite: jest.fn().mockReturnValue(true)
    };
    
    renderWithContexts(mockCountry, mockAuthContext, favoritedContext);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(mockFavoriteContext.removeFromFavorites).toHaveBeenCalledWith('USA');
  });

  it('redirects to login if user not logged in and favorite clicked', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithContexts(mockCountry, mockUnauthContext, mockFavoriteContext);
    
    // Trigger the click on the favorite button
    const favoriteButton = screen.queryByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login'); // Assuming the login page route is '/login'
  });
});
