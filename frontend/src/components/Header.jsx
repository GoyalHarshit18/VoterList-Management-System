import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

export default function Header() {
    const { lang, setLang } = useLanguage();
    const t = STRINGS[lang];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <header className="header">
            <nav className="navbar">
                <div className="logo-container">
                    <img
                        src="../src/assets/eci-logo.png"
                        alt={t.siteSubtitle}
                        className="eci-logo"
                    />
                    <div className="logo-text-block">
                        <h1 className="site-title">{t.siteTitle}</h1>
                        <p className="site-subtitle">{t.siteSubtitle}</p>
                    </div>
                </div>

                <button
                    className="hamburger"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                    aria-controls="primary-navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <ul id="primary-navigation" className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
                    <li>
                        <NavLink to="/" className="nav-link" onClick={closeMenu}>
                            {t.home}
                        </NavLink>
                    </li>

                    <li>
                        <a href="#about" className="nav-link" onClick={closeMenu}>
                            {t.about}
                        </a>
                    </li>

                    <li>
                        <a href="#services" className="nav-link" onClick={closeMenu}>
                            {t.services}
                        </a>
                    </li>

                    <li>
                        <NavLink
                            to="/blo-login"
                            className="nav-link login-btn"
                            onClick={closeMenu}
                            aria-label={t.bloLogin}
                        >
                            {t.bloLogin}
                        </NavLink>
                    </li>

                    <li>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                    </li>

                    <li className="lang-select-wrapper">
                        <select
                            className="lang-select"
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            aria-label="Select language"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                        </select>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
