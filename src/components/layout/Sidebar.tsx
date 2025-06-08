import React from 'react';
// import { Nav } from 'react-bootstrap'; // Removed
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import {
    Home,
    Users,
    GraduationCap,
    CreditCard,
    School,
    Percent,
    LogOut,
    Menu, // For toggle button
    ChevronsLeft, // Icon for collapsing
    ChevronsRight // Icon for expanding
} from 'lucide-react';
import { Button } from "@/components/ui/button"; // For toggle and logout

interface SidebarProps {
    expanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, toggleSidebar }) => {
    const { user, logout } = useAuth(); // Assuming user might be used later for role-based links
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));


    const navItems = [
        { path: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
        { path: "/parents", icon: <Users className="h-5 w-5" />, label: "Responsáveis" },
        { path: "/students", icon: <GraduationCap className="h-5 w-5" />, label: "Estudantes" },
        { path: "/payments", icon: <CreditCard className="h-5 w-5" />, label: "Pagamentos" },
        { path: "/classes", icon: <School className="h-5 w-5" />, label: "Turmas" },
        { path: "/discounts", icon: <Percent className="h-5 w-5" />, label: "Descontos" },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-card text-card-foreground shadow-lg transition-width duration-300 ease-in-out ${
                expanded ? 'w-64' : 'w-20'
            }`}
            aria-label="Menu lateral"
        >
            <div className={`flex items-center p-4 border-b border-border ${expanded ? 'justify-between' : 'justify-center'}`}>
                {expanded && <h5 className="text-lg font-semibold">School Control</h5>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label={expanded ? 'Recolher menu lateral' : 'Expandir menu lateral'}
                >
                    {expanded ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                </Button>
            </div>

            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                                    ${isActive(item.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted hover:text-muted-foreground'
                                    }
                                    ${!expanded ? 'justify-center' : ''}
                                  `}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                        {item.icon}
                        {expanded && <span className="ml-3">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto p-3 border-t border-border">
                <Button variant="outline" className="w-full" onClick={logout} aria-label="Sair">
                    <LogOut className={`h-5 w-5 ${expanded ? 'mr-2' : ''}`} />
                    {expanded && <span>Sair</span>}
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;

