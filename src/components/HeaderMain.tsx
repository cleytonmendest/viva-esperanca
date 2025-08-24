import Image from 'next/image';
import Link from 'next/link';

const HeaderMain = () => {
  return (
    <header className='w-full flex justify-center fixed top-0 z-10 bg-[var(--background)]'>
      <div className='w-full'>
        <div className='mx-auto w-full lg:max-w-7xl flex flex-col gap-3.5 justify-between items-center p-4'>
          <Link href="/" className="cursor-pointer">
            <Image src="/images/logo-ive-branco.png" alt="Logo Viva Esperança" width={200} height={75} />
          </Link>
          <nav className='w-full'>
            <ul className='flex gap-10 justify-center items-center'>
              <li>
                <Link href="/quem-somos">QUEM SOMOS</Link>
              </li>
              <li>
                <Link href="/programacao">GC&#39;s</Link>
              </li>
              <li>
                <Link href="/ofertas">DÍZIMOS E OFERTAS</Link>
              </li>
              <li>
                <Link href="/contato">CONTATO</Link>
              </li>
              <li>
                <Link href="/blog">BLOG</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default HeaderMain