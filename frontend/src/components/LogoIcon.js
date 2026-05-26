import logo from '../assets/logo-jimpitan.png';

function LogoIcon({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={logo}
      alt="Logo Jimpitan Digital"
    />
  );
}

export default LogoIcon;
