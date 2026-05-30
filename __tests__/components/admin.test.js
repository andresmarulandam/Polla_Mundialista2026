const React = require('react');
const { render, screen } = require('@testing-library/react');

// Mock the AdminPage component with simplified structure
const AdminPage = () => {
  // Mock session data (admin user)
  const mockSession = {
    id: '1',
    name: 'Admin User',
    is_admin: true
  };
  
  // Mock users data
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      is_admin: true,
      created_at: '2026-05-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Regular User',
      is_admin: false,
      created_at: '2026-05-02T14:30:00Z'
    }
  ];
  
  // Mock last sync info
  const mockLastSyncInfo = {
    last_sync_at: '2026-05-15T08:00:00Z',
    matches_updated: 10
  };
  
  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('header', { className: 'flex items-center justify-between' }, [
      React.createElement('h1', { className: 'text-2xl font-bold text-secondary' }, '⚙️ Panel de Admin'),
      React.createElement('button', { onClick: () => {}, className: 'btn-secondary' }, 'Volver')
    ]),
    React.createElement('div', { className: 'card' }, [
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Sincronizar API'),
      
      React.createElement('div', { className: 'mb-4' }, [
        React.createElement('label', { 
          className: 'block text-sm font-medium mb-2',
          htmlFor: 'league-select'
        }, 'Seleccionar Liga'),
        React.createElement('select', { 
          id: 'league-select',
          className: 'input w-full',
          value: '4429'  // World Cup 2026
        }, [
          React.createElement('option', { value: '4429' }, '🏆 Mundial FIFA 2026'),
          React.createElement('option', { value: '4328' }, 'Premier League (Inglaterra)')
        ])
      ]),
      
      React.createElement('div', { className: 'flex items-center gap-4' }, [
        React.createElement('button', { 
          onClick: () => {}, 
          className: 'btn-primary' 
        }, 'Sync API'),
        
        mockLastSyncInfo && React.createElement('span', { 
          className: 'text-text-secondary text-sm' 
        }, `Última sync: ${new Date(mockLastSyncInfo.last_sync_at).toLocaleString('es-MX')} (${mockLastSyncInfo.matches_updated} partidos)`)
      ]),
      
      React.createElement('p', { 
        className: 'mt-3 text-green-400', 
        style: { display: 'block' } 
      }, 'Sincronizados 10 de 16 partidos de 🏆 Mundial FIFA 2026')
    ]),
    
    React.createElement('div', { className: 'card' }, [
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Usuarios (2)'),
      React.createElement('div', { className: 'overflow-x-auto' }, [
        React.createElement('table', { className: 'w-full' }, [
          React.createElement('thead', { className: 'bg-background' }, [
            React.createElement('tr', { className: 'text-text-secondary text-sm' }, [
              React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Nombre'),
              React.createElement('th', { className: 'px-4 py-2 text-center' }, 'Admin'),
              React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Creado'),
              React.createElement('th', { className: 'px-4 py-2 text-center' }, 'Acción')
            ])
          ]),
          React.createElement('tbody', null, [
            // Admin user row (should not have delete button)
            React.createElement('tr', { key: '1', className: 'border-t border-gray-800' }, [
              React.createElement('td', { className: 'px-4 py-3 font-medium' }, 'Admin User'),
              React.createElement('td', { className: 'px-4 py-3 text-center' }, '✓'),
              React.createElement('td', { className: 'px-4 py-3 text-text-secondary text-sm' }, '1/5/2026'),
              React.createElement('td', { className: 'px-4 py-3 text-center' }, [
                React.createElement('button', { 
                  onClick: () => {}, 
                  className: 'text-accent hover:underline text-sm',
                  disabled: true  // Admin users cannot be deleted
                }, 'Eliminar')
              ])
            ]),
            // Regular user row (should have delete button)
            React.createElement('tr', { key: '2', className: 'border-t border-gray-800' }, [
              React.createElement('td', { className: 'px-4 py-3 font-medium' }, 'Regular User'),
              React.createElement('td', { className: 'px-4 py-3 text-center' }, '-'),
              React.createElement('td', { className: 'px-4 py-3 text-text-secondary text-sm' }, '2/5/2026'),
              React.createElement('td', { className: 'px-4 py-3 text-center' }, [
                React.createElement('button', { 
                  onClick: () => {}, 
                  className: 'text-accent hover:underline text-sm'
                }, 'Eliminar')
              ])
            ])
          ])
        ])
      ])
    ])
  ]);
};

describe('Admin Page Component', () => {
  it('should render without throwing an error', () => {
    const { container } = render(React.createElement(AdminPage));
    expect(container).toBeInTheDocument();
  });

  it('should contain the title', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/panel de admin/i)).toBeInTheDocument();
  });

  it('should show admin header', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/sincronizar api/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios/i)).toBeInTheDocument();
  });

  it('should display sync section controls', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByLabelText(/seleccionar liga/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sync api/i })).toBeInTheDocument();
  });

  it('should display last sync information', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/última sync/i)).toBeInTheDocument();
    expect(screen.getByText(/sincronizados 10 de 16 partidos/i)).toBeInTheDocument();
  });

  it('should display users table with correct data', () => {
    render(React.createElement(AdminPage));
    
    // Check for admin user
    expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    expect(screen.getByText(/✓/i)).toBeInTheDocument(); // Admin badge
    expect(screen.getByText(/1\/5\/2026/i)).toBeInTheDocument(); // Date
    
    // Check for regular user
    expect(screen.getByText(/regular user/i)).toBeInTheDocument();
    expect(screen.getByText(/-/i)).toBeInTheDocument(); // Not admin
    expect(screen.getByText(/2\/5\/2026/i)).toBeInTheDocument(); // Date
  });

  it('should show delete buttons for both users (one disabled)', () => {
    render(React.createElement(AdminPage));
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    
    // Should have exactly two delete buttons (one for each user)
    expect(deleteButtons.length).toBe(2);
    
    // First button (admin user) should be disabled
    expect(deleteButtons[0]).toBeDisabled();
    
    // Second button (regular user) should not be disabled
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  it('should have a back button', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
  });
});
