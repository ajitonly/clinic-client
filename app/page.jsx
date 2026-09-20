import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="hero">
      <div className="hero-text">
        <h1>Smile brighter<br />everyday.</h1>
        <p className="hero-subtitle">
          Clinic is a clinic in Cavite that ensures you have a
          healthy oral health.
        </p>
        <Link href="/book">
          <button type="button">Book Appointment</button>
        </Link>
      </div>

      <div className="hero-image">
        <img src="/hero-photo.jpg" alt="Smiling patient" />
      </div>

      <nav className="mobile-nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#location">Location</a>
        <a href="#contact">Contact</a>
      </nav>
    </main>
  );
}