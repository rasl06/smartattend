export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Загрузка...</p>
      </div>
    </div>
  );
}
