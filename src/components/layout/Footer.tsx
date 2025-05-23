import React from 'react';
import { useFooterViewModel } from './viewmodels/useFooterViewModel';

/**
 * Footer is a functional component that displays the application's footer section.
 * It typically contains copyright information and potentially other links or notices.
 *
 * @returns {React.ReactElement} A footer element with copyright text.
 */
const Footer: React.FC = () => {
    const vm = useFooterViewModel();

    return (
        <footer className="bg-dark text-light mt-auto" role="contentinfo" aria-label={vm.t('layout.footer.ariaLabel')}>
            <div className="text-center p-3 small">
                {vm.t('layout.footer.copyright', { year: vm.currentYear })}
            </div>
        </footer>
    );
};

export default Footer;

