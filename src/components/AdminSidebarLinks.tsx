
import React from "react";
import { NavLink } from "react-router-dom";
import { Building2, FileText, BarChart2, CreditCard, ShoppingBag, Briefcase, Users, Settings } from "lucide-react";

const AdminSidebarLinks: React.FC = () => {
  const activeClassName = 
    "flex items-center space-x-3 text-sm font-semibold bg-white rounded-md px-3 py-2 text-esocial-blue";
  const inactiveClassName = 
    "flex items-center space-x-3 text-sm font-medium rounded-md px-3 py-2 text-gray-600 hover:bg-white/50 hover:text-esocial-blue transition-colors";

  return (
    <div className="space-y-1">
      <NavLink 
        to="/admin/dashboard" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
        end
      >
        <BarChart2 size={20} />
        <span>Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/admin/clientes" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Building2 size={20} />
        <span>Clientes Sistema</span>
      </NavLink>
      
      <NavLink 
        to="/admin/planos" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <ShoppingBag size={20} />
        <span>Planos</span>
      </NavLink>
      
      <NavLink 
        to="/admin/contratos" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Briefcase size={20} />
        <span>Contratos</span>
      </NavLink>
      
      <NavLink 
        to="/admin/faturamento" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <CreditCard size={20} />
        <span>Faturamento</span>
      </NavLink>

      <NavLink 
        to="/admin/usuarios" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Users size={20} />
        <span>Usuários</span>
      </NavLink>

      <NavLink 
        to="/minha-conta" 
        className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
      >
        <Settings size={20} />
        <span>Minha Conta</span>
      </NavLink>
    </div>
  );
};

export default AdminSidebarLinks;
