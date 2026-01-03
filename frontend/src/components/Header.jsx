import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

export default function Header() {
    const { lang, setLang } = useLanguage();
    const t = STRINGS[lang];
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="header">
            <nav className="navbar">
                <div className="logo-container">
                    <img
                        src="/src/assets/eci-logo.png"
                        alt="Election Commission of India"
                        className="eci-logo"
                    />
                    <div className="logo-text-block">
                        <h1 className="site-title">Unified Voter System</h1>
                        <p className="site-subtitle">Election Commission of India</p>
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
                            aria-label="Login to BLO Portal"
                        >
                            {t.bloLogin}
                        </NavLink>
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
