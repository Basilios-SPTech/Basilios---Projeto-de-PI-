import { useState, useEffect } from 'react';
import { Menu, User, Search, Home, ShoppingBag, Heart, Settings, LogOut, Package } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // useEffect para detectar scroll e reduzir header
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect para detectar a seção ativa baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[data-section]');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    'Hamburguer', 'Pizza', 'Bebidas', 'Sobremesas',
    'Saladas', 'Massas', 'Pratos', 'Petiscos',
    'Combos', 'Vegetariano', 'Vegano', 'Kids'
  ];

  // ITENS DO MENU LATERAL - Configuração centralizada
  const menuItems = [
    { icon: Home, label: 'Início', href: '#home' },
    { icon: ShoppingBag, label: 'Meus Pedidos', href: '#pedidos' },
    { icon: Package, label: 'Meus Endereços', href: '#enderecos' },
    { icon: Settings, label: 'Configurações', href: '#config' },
    { icon: LogOut, label: 'Sair', href: '#logout' }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap');

        .scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .scroll-container::-webkit-scrollbar-track {
          background: #2b2b2b;
        }
        
        .scroll-container::-webkit-scrollbar-thumb {
          background: #e85d5d;
          border-radius: 4px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #d64545;
        }
        
        .scroll-container {
          scrollbar-color: #e85d5d #2b2b2b;
          scrollbar-width: thin;
        }

        .section-link {
          color: #f5f5f0;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          font-family: 'Montserrat', sans-serif;
          position: relative;
        }

        .section-link:hover {
          color: #e85d5d;
          transform: scale(1.15);
        }

        .section-link.active {
          color: #e85d5d;
        }

        .section-link.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: #e85d5d;
          border-radius: 2px;
        }

        .menu-item {
          color: #f5f5f0;
          text-decoration: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1rem;
        }

        .menu-item:hover {
          background: linear-gradient(135deg, #e85d5d 0%, #d64545 100%);
          transform: translateX(10px);
          box-shadow: 0 4px 12px rgba(232, 93, 93, 0.3);
        }

        .menu-item svg {
          width: 24px;
          height: 24px;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .logo-text {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #e85d5d;
          letter-spacing: -0.5px;
        }

        @media (max-width: 768px) {
          .section-link {
            font-size: 0.8rem;
          }
          
          .logo-container {
            display: none !important;
          }
          
          .search-container {
            width: 200px !important;
          }
          
          .search-input {
            font-size: 0.85rem !important;
          }
          
          .header-grid {
            gap: 1rem !important;
          }

          .menu-item {
            font-size: 0.9rem;
            padding: 0.9rem 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .section-link {
            font-size: 0.7rem;
          }
          
          .logo-container {
            display: none !important;
          }
          
          .search-container {
            width: 150px !important;
          }
          
          .search-input {
            font-size: 0.75rem !important;
            padding-left: 0.2rem !important;
          }
          
          .icon-button {
            padding: 0.3rem !important;
          }
          
          .icon-button svg {
            width: 24px !important;
            height: 24px !important;
          }
          
          .search-icon {
            width: 16px !important;
            height: 16px !important;
          }
          
          .header-grid {
            gap: 0.5rem !important;
          }
          
          .center-content {
            gap: 0.5rem !important;
          }

          .menu-item {
            font-size: 0.85rem;
            padding: 0.8rem 1rem;
          }
        }

        @media (max-width: 360px) {
          .search-container {
            width: 120px !important;
          }
          
          .search-input {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
      <header style={{
        backgroundColor: '#2b2b2b',
        color: '#f5f5f0',
        padding: isScrolled ? '0.7rem 1rem' : '1.3rem 1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        fontFamily: "'Montserrat', sans-serif",
        transition: 'padding 0.3s ease'
      }}>
        {/* Linha superior com botões e barra de pesquisa */}
        <div className="header-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          width: '100%',
          gap: '2rem'
        }}>
          {/* Lado esquerdo - Botão de menu */}
          <button
            onClick={toggleMenu}
            className="icon-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#f5f5f0',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              marginLeft: '1rem',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(232, 93, 93, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Menu size={28} />
          </button>

          {/* Centro - Logo e Barra de pesquisa */}
          <div className="center-content" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem'
          }}>
            {/* Logo */}
            <div className="logo-container" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="logo-text">FOODIE</span>
            </div>

            {/* Barra de pesquisa */}
            <div className="search-container" style={{
              width: '250px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#3a3a3a',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                border: '1px solid rgba(245, 245, 240, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#e85d5d';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(232, 93, 93, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 245, 240, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <Search className="search-icon" size={18} style={{ color: '#888', marginRight: '0.5rem', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f5f5f0',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.9rem',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Lado direito - Ícone de perfil */}
          <button
            className="icon-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#f5f5f0',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              marginRight: '1rem',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(232, 93, 93, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <User size={28} />
          </button>
        </div>

        {/* Linha inferior com textos das seções */}
        <div 
          className="scroll-container" 
          style={{
            marginTop: '1.5rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            paddingBottom: '0.5rem',
            opacity: isScrolled ? '0' : '1',
            maxHeight: isScrolled ? '0' : '50px',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            minWidth: 'max-content',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}>
            {sections.map((section, i) => (
              <span 
                key={i} 
                className={`section-link ${activeSection === i ? 'active' : ''}`}
                onClick={() => setActiveSection(i)}
              >
                {section}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Menu lateral */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          boxShadow: '2px 0 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: '2rem 1.5rem',
          animation: 'slideIn 0.3s ease-out',
          overflowY: 'auto'
        }}>
          {/* Cabeçalho do menu lateral */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #2b2b2b'
          }}>
            <span className="logo-text" style={{ fontSize: '1.3rem' }}>MENU</span>
            <button
              onClick={toggleMenu}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5f5f0',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.5rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(232, 93, 93, 0.2)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>
          </div>

          {/* NAVEGAÇÃO DO MENU LATERAL - Aqui aparecem os itens do menu */}
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {/* Mapeia os itens do menu configurados no array menuItems */}
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a 
                  key={index}
                  href={item.href} 
                  className="menu-item"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(`Navegando para: ${item.label}`);
                    toggleMenu();
                  }}
                >
                  {/* Ícone do item do menu */}
                  <Icon />
                  {/* Texto/Label do item do menu */}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Seção de informações adicionais no menu */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: '2px solid #2b2b2b',
            marginTop: '3rem'
          }}>
            <div style={{
              color: '#888',
              fontSize: '0.85rem',
              fontFamily: "'Montserrat', sans-serif",
              textAlign: 'center'
            }}>
              <p style={{ margin: '0.5rem 0' }}>Versão 1.0.0</p>
              <p style={{ margin: '0.5rem 0' }}>© 2025 Foodie</p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar o menu ao clicar fora */}
      {isMenuOpen && (
        <div
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      )}
    </>
  );
}