export default function Spinner({ size = 'md', brand = false, center = false }) {
  const cls = [
    'spinner',
    size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '',
    brand ? 'spinner-brand' : '',
  ].filter(Boolean).join(' ');

  if (center) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div className={cls} />
      </div>
    );
  }

  return <div className={cls} />;
}
