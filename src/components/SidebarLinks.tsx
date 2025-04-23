
import React from "react";
import { NavLink } from "react-router-dom";
import { Building2, ClipboardList, FileQuestion, FileSearch, FileText, Users, BarChart2, BookOpen, Settings } from "lucide-react";

const SidebarLinks: React.FC = () => {
  const activeClassName = 
    "flex items-center space-x-3 text-sm font-semibold bg-white rounded-md px-3 py-2 text-esocial-blue";
  const inactiveClassName = 
    "flex items-center space-x-3 text-sm font-medium rounded-md px-3 py-2 text-gray-600 hover:bg-white/50 hover:text-esocial-blue transition-colors";

  return (
    <div className="space-y-1">
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        end
      >
        <FileText size={20} />
        <span>Formulário</span>
      </NavLink>
      
      <NavLink 
        to="/como-preencher" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <BookOpen size={20} />
        <span>Como Preencher</span>
      </NavLink>
      
      <NavLink 
        to="/como-avaliar" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <FileSearch size={20} />
        <span>Como Avaliar</span>
      </NavLink>
      
      <NavLink 
        to="/relatorios" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <BarChart2 size={20} />
        <span>Relatórios</span>
      </NavLink>

      <NavLink 
        to="/minha-conta" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Settings size={20} />
        <span>Minha Conta</span>
      </NavLink>
      
      <div className="py-1">
        <div className="h-px bg-gray-200 my-2"></div>
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Cadastros
        </h3>
      </div>
      
      <NavLink 
        to="/cadastros/empresas" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Building2 size={20} />
        <span>Empresas</span>
      </NavLink>
      
      <NavLink 
        to="/cadastros/funcionarios" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Users size={20} />
        <span>Funcionários</span>
      </NavLink>
    </div>
  );
};

export default SidebarLinks;
