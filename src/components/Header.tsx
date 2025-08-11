import { useState, useEffect } from 'react';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import GlobalSearch from '@/components/GlobalSearch';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigation = [{
    name: 'Home',
    href: '/'
  }, {
    name: 'Products',
    href: '/products'
  }, {
    name: 'About',
    href: '/about'
  }, {
    name: 'History',
    href: '/history'
  }, {
    name: 'Contact',
    href: '/contact'
  }];
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        {/* Main Navigation Row */}
        <div className="flex items-center justify-between py-3">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/">
              <img src="/lovable-uploads/57d70b9a-de38-4715-90d7-de1bb54d9d1c.png" alt="Phelan Manufacturing Corporation" className={`w-auto cursor-pointer hover:opacity-80 transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`} />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map(item => item.href.startsWith('#') ? <a key={item.name} href={item.href} className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                    {item.name}
                  </a> : <Link key={item.name} to={item.href} className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                    {item.name}
                  </Link>)}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex w-full max-w-md mx-4">
            <GlobalSearch />
          </div>

          {/* Phone Number & Auth Section - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Phone Number */}
            <div className="flex items-center space-x-2 text-primary">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">1-800-328-2358</span>
            </div>
            
            {user ? <div className="flex items-center space-x-2">
                {isAdmin && <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin Panel
                    </Button>
                  </Link>}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div> : <Link to="/auth">
                
              </Link>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navigation.map(item => item.href.startsWith('#') ? <a key={item.name} href={item.href} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200 font-medium" onClick={() => setIsMenuOpen(false)}>
                    {item.name}
                  </a> : <Link key={item.name} to={item.href} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200 font-medium" onClick={() => setIsMenuOpen(false)}>
                    {item.name}
                  </Link>)}
              
              {/* Mobile Auth Section */}
              {user ? <div className="space-y-2 px-3 py-2">
                  {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Admin Panel
                      </Button>
                    </Link>}
                  <Button variant="ghost" size="sm" onClick={() => {
              signOut();
              setIsMenuOpen(false);
            }} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div> : <div className="px-3 py-2">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Admin Login
                    </Button>
                  </Link>
                </div>}
              
              <div className="flex items-center space-x-2 px-3 py-2 text-primary border-t border-border">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">1-800-328-2358</span>
              </div>
            </div>
          </div>}
      </div>
    </header>;
};
export default Header;