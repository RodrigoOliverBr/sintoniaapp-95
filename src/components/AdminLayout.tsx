
import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import AdminSidebarLinks from "./AdminSidebarLinks";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "next-themes";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  
  // Force remove dark class to ensure light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
    document.documentElement.style.color = "black";
    document.body.style.color = "black";
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    navigate("/login");
  };

  return (
    <ThemeProvider defaultTheme="light" forcedTheme="light">
      <div className="flex h-full min-h-screen bg-white">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r print:hidden">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b bg-esocial-blue">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png" 
                  alt="Sintonia Logo" 
                  className="h-10 mr-2" 
                />
                <span className="text-xl font-semibold text-white">
                  Sintonia Admin
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-4 space-y-1">
                <AdminSidebarLinks />
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t p-4">
              <div className="text-xs text-muted-foreground">© 2025 eSocial Brasil</div>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              className="text-esocial-darkGray bg-white shadow rounded-full"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full bg-white">
              <div className="p-4 border-b flex justify-between items-center bg-esocial-blue text-white">
                <div className="flex items-center">
                  <img 
                    src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png" 
                    alt="Sintonia Logo" 
                    className="h-8 mr-2" 
                  />
                  <span className="font-semibold text-lg">Sintonia Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white"
                >
                  <X size={18} />
                </Button>
              </div>
              <nav className="flex-1 p-4">
                <AdminSidebarLinks />
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 md:pl-64">
          <header className="bg-white shadow print:hidden">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <h1 className="text-2xl font-bold text-esocial-darkGray">
                  {title}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center text-sm text-gray-600 mr-4">
                    <span className="font-medium">eSocial Brasil</span>
                    <span className="mx-2">•</span>
                    <span>Admin</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigate("/admin/usuarios")}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Usuários</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                  
                  <img 
                    src="/lovable-uploads/55c55435-602d-4685-ade6-6d83d636842d.png" 
                    alt="eSocial Brasil Logo" 
                    className="h-12" 
                  />
                </div>
              </div>
            </div>
          </header>
          <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
