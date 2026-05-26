function AuthTabs({ activePage, onChangePage }) {
  return (
    <div className="tabs">
      <button
        type="button"
        className={activePage === 'login' ? 'active' : ''}
        onClick={() => onChangePage('login')}
      >
        Login
      </button>
      <button
        type="button"
        className={activePage === 'register' ? 'active' : ''}
        onClick={() => onChangePage('register')}
      >
        Register
      </button>
    </div>
  );
}

export default AuthTabs;
