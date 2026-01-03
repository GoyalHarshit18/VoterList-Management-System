import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

export default function Hero() {
    const { lang } = useLanguage();
    const t = STRINGS[lang];

    return (
        <section id="home" className="hero">
            <div className="container hero-content">
                <h2>{t.heroTitle}</h2>
                <p>{t.heroDesc}</p>

                <div className="hero-buttons">
                    <a href="#services" className="btn btn-primary">
                        {t.voterServices}
                    </a>
                    <Link to="/blo-login" className="btn btn-secondary">
                        {t.bloPortal}
                    </Link>
                </div>
            </div>
        </section>
    );
}
