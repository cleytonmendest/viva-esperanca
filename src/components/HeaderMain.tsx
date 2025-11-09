'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const HeaderMain = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/quem-somos', label: 'QUEM SOMOS' },
    { href: '/programacao', label: "PROGRAMAÇÃO" },
    { href: '/ofertas', label: 'DÍZIMOS E OFERTAS' },
    { href: '/contato', label: 'CONTATO' },
    { href: '/blog', label: 'BLOG' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className='w-full flex justify-center fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
      <div className='w-full'>
        <div className='mx-auto w-full lg:max-w-7xl flex justify-between items-center p-4'>
          {/* Logo */}
          <Link href="/" className="cursor-pointer">
            <Image
              src="/images/logo-ive-branco.png"
              alt="Logo Viva Esperança"
              width={180}
              height={68}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center gap-8'>
            <ul className='flex gap-8 items-center'>
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">ÁREA RESTRITA</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className='lg:hidden'>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className='flex flex-col gap-6 mt-8'>
                <Link href="/" className="cursor-pointer mb-4">
                  <Image
                    src="/images/logo-ive-branco.png"
                    alt="Logo Viva Esperança"
                    width={160}
                    height={60}
                  />
                </Link>
                <ul className='flex flex-col gap-4'>
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`text-base font-medium transition-colors hover:text-primary block py-2 ${
                          isActive(item.href)
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      ÁREA RESTRITA
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default HeaderMain
