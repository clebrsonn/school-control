import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Footer is a functional component that displays the application's footer section.
 * It typically contains copyright information and potentially other links or notices.
 *
 * @returns {React.ReactElement} A footer element with copyright text.
 */
const Footer: React.FC = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light mt-auto" role="contentinfo" aria-label={t('layout.footer.ariaLabel')}>
            <div className="text-center p-3 small">
                {t('layout.footer.copyright', { year: currentYear })}
            </div>
        </footer>
    );
};

export default Footer;

