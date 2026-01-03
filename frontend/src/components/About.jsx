import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

export default function About() {
    const { lang } = useLanguage();
    const t = STRINGS[lang];

    return (
        <section id="about" className="section">
            <div className="container">
                <h2 className="section-title">{t.aboutTitle}</h2>
                {/* <p className="section-subtitle">{t.aboutSubtitle}</p> */}

                <div className="info-grid">
                    <div className="info-card">
                        <i className="fas fa-database"></i>
                        <h3>{t.aboutCard1Title}</h3>
                        <p>{t.aboutCard1Desc}</p>
                    </div>

                    <div className="info-card">
                        <i className="fas fa-id-card"></i>
                        <h3>{t.aboutCard2Title}</h3>
                        <p>{t.aboutCard2Desc}</p>
                    </div>

                    <div className="info-card">
                        <i className="fas fa-shield-alt"></i>
                        <h3>{t.aboutCard3Title}</h3>
                        <p>{t.aboutCard3Desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
