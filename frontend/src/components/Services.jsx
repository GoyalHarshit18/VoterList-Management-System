import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

export default function Services() {
    const { lang } = useLanguage();
    const t = STRINGS[lang];

    return (
        <section id="services" className="section light-bg">
            <div className="container">
                <h2 className="section-title">{t.servicesTitle}</h2>

                <div className="info-grid">
                    <div className="info-card">
                        <i className="fas fa-user-check"></i>
                        <h3>{t.service1Title}</h3>
                        <p>{t.service1Desc}</p>
                    </div>

                    <div className="info-card">
                        <i className="fas fa-user-edit"></i>
                        <h3>{t.service2Title}</h3>
                        <p>{t.service2Desc}</p>
                    </div>

                    <div className="info-card">
                        <i className="fas fa-chart-line"></i>
                        <h3>{t.service3Title}</h3>
                        <p>{t.service3Desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
