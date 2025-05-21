import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark text-light mt-auto" role="contentinfo" aria-label="Rodapé">
            <div className="text-center p-3 small">
                © {new Date().getFullYear()} School Control. Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;

