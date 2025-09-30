import { useState, useEffect } from 'react';
import { Menu, User, Search } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

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
      // ADICIONE AQUI A LÓGICA PARA DETECTAR QUAL SEÇÃO ESTÁ VISÍVEL
      // Exemplo:
      // const sections = document.querySelectorAll('section[data-section]');
      // sections.forEach((section, index) => {
      //   const rect = section.getBoundingClientRect();
      //   if (rect.top <= 100 && rect.bottom >= 100) {
      //     setActiveSection(index);
      //   }
      // });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    'Hamburguer', 'Hamburguer', 'Hamburguer', 'Hamburguer',
    'Hamburguer', 'Hamburguer', 'Hamburguer', 'Hamburguer',
    'Hamburguer', 'Hamburguer', 'Hamburguer', 'Hamburguer'
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
        }

        .section-link:hover {
          color: #e85d5d;
          transform: scale(1.15);
        }

        .section-link.active {
          color: #e85d5d;
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
              transition: 'opacity 0.2s',
              marginLeft: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
              width: '150px',
              height: '50px',
              border: '2px dashed #555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: '#888',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: '600'
            }}>
              Logo
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
                border: '1px solid rgba(245, 245, 240, 0.2)'
              }}>
                <Search className="search-icon" size={18} style={{ color: '#888', marginRight: '0.5rem', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
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
              transition: 'opacity 0.2s',
              marginRight: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <User size={28} />
          </button>
        </div>

        {/* Linha inferior com textos "hamburguer" */}
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
          width: '300px',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          boxShadow: '2px 0 10px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: '2rem 1rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(-100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '2rem'
          }}>
            <button
              onClick={toggleMenu}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5f5f0',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.5rem'
              }}
            >
              ✕
            </button>
          </div>

        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <a href="#" style={{
            color: '#f5f5f0',
            textDecoration: 'none',
            padding: '1rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2b2b2b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Opção 1
          </a>
          <a href="#" style={{
            color: '#f5f5f0',
            textDecoration: 'none',
            padding: '1rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2b2b2b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Opção 2
          </a>
          <a href="#" style={{
            color: '#f5f5f0',
            textDecoration: 'none',
            padding: '1rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            fontFamily: "'Montserrat', sans-serif"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2b2b2b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Opção 3
          </a>
          <a href="#" style={{
            color: '#f5f5f0',
            textDecoration: 'none',
            padding: '1rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            fontFamily: "'Montserrat', sans-serif"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2b2b2b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Opção 4
          </a>
        </nav>
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
            zIndex: 999
          }}
        />
      )}
    </>
  );
}