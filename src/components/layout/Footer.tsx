import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary text-secondary-foreground mt-auto" role="contentinfo" aria-label="Rodapé">
            <div className="text-center p-4 text-sm">
                © {new Date().getFullYear()} School Control. Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;

