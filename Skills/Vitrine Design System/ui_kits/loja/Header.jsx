function Header({ cartCount, go }) {
  const { SearchBar, IconButton, Icon } = window.VitrineDesignSystem_f1a071;
  const nav = ['Ofertas do dia', 'Mais vendidos', 'Novidades', 'Áudio', 'Casa', 'Cozinha', 'Livros', 'Games'];
  return (
    <header style={{ background: 'var(--ink-900)', color: 'var(--white)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--gutter)', height: 'var(--header-h)', display: 'flex', alignItems: 'center', gap: 28 }}>
        <a onClick={() => go('home')} style={{ font: '800 28px/1 var(--font-sans)', letterSpacing: '-.03em', color: 'var(--white)', textDecoration: 'none', cursor: 'pointer' }}>vitrine<span style={{ color: 'var(--lime-500)' }}>.</span></a>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, color: 'var(--white)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
          <Icon name="map-pin" size={18} color="var(--lime-500)" />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '400 12px/1 var(--font-sans)', color: 'var(--ink-300)' }}>Entregar em</span><span style={{ font: '600 14px/1 var(--font-sans)' }}>São Paulo 01310</span></span>
        </button>
        <SearchBar inverse style={{ flex: 1 }} onSubmit={() => go('home')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconButton icon="heart" label="Favoritos" variant="inverse" />
          <IconButton icon="user" label="Minha conta" variant="inverse" />
          <IconButton icon="shopping-bag" label="Carrinho" variant="inverse" badge={cartCount} onClick={() => go('cart')} />
        </div>
      </div>
      <nav style={{ borderTop: '1px solid var(--border-inverse)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--gutter)', height: 48, display: 'flex', alignItems: 'center', gap: 28, overflowX: 'auto' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 14px/1 var(--font-sans)' }}><Icon name="menu" size={18} />Categorias</span>
          {nav.map((n, i) => <a key={n} onClick={() => go('home')} style={{ font: '500 14px/1 var(--font-sans)', color: i === 0 ? 'var(--lime-500)' : 'var(--ink-200)', textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{n}</a>)}
        </div>
      </nav>
    </header>
  );
}
window.Header = Header;
