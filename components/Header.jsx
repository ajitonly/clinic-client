import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="logo">
        <span className="logo-icon">+</span>
        Clinic
      </Link>
      <nav className="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#location">Location</a>
        <a href="#contact">Contact</a>
      </nav>
      
    </header>
  );
}