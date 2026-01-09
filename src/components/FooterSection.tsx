import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FooterSection = () => {
  const [email, setEmail] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const linkSections = [
    {
      title: 'Product',
      links: [
        { label: 'Docs', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Playground', href: '/dashboard/playground' },
        { label: 'Status Page', href: 'https://status.dekaos.com', external: true },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Discord', href: 'https://discord.gg/dekaos', external: true },
        { label: 'GitHub', href: 'https://github.com/dekaos/dekaos', external: true },
        { label: 'Twitter', href: 'https://twitter.com/dekaos_xyz', external: true },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: 'https://github.com/dekaos', label: 'Follow on GitHub' },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/dekaos_xyz', label: 'Follow on Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com/company/dekaos', label: 'Follow on LinkedIn' },
    { 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ), 
      href: 'https://discord.gg/dekaos', 
      label: 'Join Discord' 
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <footer className="relative bg-[hsl(222_47%_6%)] border-t border-primary/20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Column 1: Brand & Status */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-primary">deKAOS</h2>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Decentralized Acoustic Entropy Network
              </p>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-body text-xs font-medium text-emerald-400">
                Network Healthy
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              Last finalized: 2min ago
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="md:col-span-5">
            {/* Desktop Links */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              {linkSections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-body text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile Accordion Links */}
            <div className="md:hidden space-y-2">
              {linkSections.map((section) => (
                <div key={section.title} className="border-b border-border/50">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full py-3 font-body text-sm font-semibold text-foreground"
                    aria-expanded={openSection === section.title}
                  >
                    {section.title}
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openSection === section.title ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <motion.ul
                    initial={false}
                    animate={{ 
                      height: openSection === section.title ? 'auto' : 0,
                      opacity: openSection === section.title ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pb-3"
                  >
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Social + Newsletter */}
          <div className="md:col-span-3">
            {/* Social Icons */}
            <div className="flex items-center gap-4 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div>
              <h3 className="font-body text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Stay Updated
              </h3>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="email-input" className="sr-only">Email address</label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background border-primary/50 text-foreground placeholder:text-muted-foreground text-sm focus:border-primary focus:ring-primary/20"
                  required
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-primary-foreground font-body font-medium"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal + Copyright */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-muted-foreground text-center md:text-left">
              © 2024 deKAOS. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <a 
                href="/privacy" 
                className="font-body text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-border">|</span>
              <a 
                href="/terms" 
                className="font-body text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-border">|</span>
              <a 
                href="/cookies" 
                className="font-body text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
