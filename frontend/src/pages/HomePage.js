import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  useEffect(() => {
    const carouselItems = document.querySelectorAll('#reviews_direction .carousel-item');
    carouselItems.forEach((item) => {
      const minPerSlide = 1;
      let next = item.nextElementSibling;
      if (!next) {
        next = item.parentElement.firstElementChild;
      }
      if (next && next.firstElementChild) {
        item.appendChild(next.firstElementChild.cloneNode(true));
      }
      for (let i = 0; i < minPerSlide; i++) {
        next = next.nextElementSibling;
        if (!next) {
          next = item.parentElement.firstElementChild;
        }
        if (next && next.firstElementChild) {
          item.appendChild(next.firstElementChild.cloneNode(true));
        }
      }
    });

    const handleScroll = () => {
      const header = document.querySelector('.fixed-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home-page">
      <div className="top-bar">
        <div className="container">
          <div className="ref-travel">Путешествуй вместе с 
            <a href="https://www.neoflex.ru" target="_blank" rel="noopener noreferrer" style={{color: '#FF4B4B', textDecoration: 'none'}}> Neoflex</a>
          </div>
        </div>
      </div>
      <header className="header fixed-header">
        <div className="container header-container">
          <div className="logo">
            <Link to="/">
              <h1><span className="logo-icon">✦</span> NeoSplav</h1>
            </Link>
          </div>
          <nav className="navigation">
            <ul>
              <li><Link to="/calendar">Календарь</Link></li>
              <li><Link to="/team">Команда</Link></li>
              <li><Link to="/journal">Дневник</Link></li>
              <li><Link to="/contacts">Контакты</Link></li>
              <li><Link to="/participant">Участнику</Link></li>
            </ul>
          </nav>
          <div className="user-profile">
            <Link to="/auth" className="profile-icon" title="Личный кабинет">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </header>
      
      <section className="hero">
        <div className="container">
          <h2>Планирование сплавов AquaStream</h2>
          <p>Ваш надежный партнер в организации незабываемых сплавов по рекам.</p>
          <Link to="/trips" className="btn">Узнать больше</Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h3>Наши преимущества</h3>
          <div className="feature-cards">
            <div className="card">
              <h4>Индивидуальный подход</h4>
              <p>Планируйте сплавы с учетом ваших пожеланий.</p>
            </div>
            <div className="card">
              <h4>Профессиональные гиды</h4>
              <p>Опытные проводники гарантируют безопасность и комфорт.</p>
            </div>
            <div className="card">
              <h4>Удобный интерфейс</h4>
              <p>Простая и интуитивная платформа для планирования сплавов.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h3>О компании</h3>
          <p>Мы, AquaStream, являемся лидерами в планировании уникальных сплавов, предлагая индивидуальные маршруты для каждого клиента. Наш опыт и профессиональный подход гарантируют незабываемые поездки и безопасность на любом маршруте.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 AquaStream. Все права защищены.</p>
          <div className="social">
            <a href="https://github.com/egorov-ma/aquastream" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://t.me/neosplav" target="_blank" rel="noopener noreferrer">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 