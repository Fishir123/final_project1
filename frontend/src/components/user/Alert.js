function Alert({ alert }) {
  if (!alert) return null;

  return <div className={`alert ${alert.type}`}>{alert.message}</div>;
}

export default Alert;
