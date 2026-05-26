import LogoIcon from '../LogoIcon';

function AuthHeader({ title, apiUrl }) {
  return (
    <>
      <div className="brand center">
        <LogoIcon />
        <div>
          <p className="eyebrow">Jimpitan Digital</p>
          <h1>{title}</h1>
        </div>
      </div>
    </>
  );
}

export default AuthHeader;
