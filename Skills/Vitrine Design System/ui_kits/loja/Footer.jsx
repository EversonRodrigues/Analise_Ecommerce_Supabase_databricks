function Footer() {
  const cols = [['Conheça a Vitrine', ['Sobre nós', 'Carreiras', 'Sustentabilidade']], ['Ajuda', ['Seus pedidos', 'Trocas e devoluções', 'Fale conosco']], ['Pagamento', ['Pix', 'Cartão em até 10x', 'Boleto']], ['Venda conosco', ['Seja um parceiro', 'Central do vendedor']]];
  return (
    <footer style={{ background: 'var(--ink-950)', color: 'var(--ink-300)', marginTop: 'var(--space-20)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '64px var(--gutter) 40px', display: 'grid', gridTemplateColumns: '1.3fr repeat(4, 1fr)', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ font: '800 28px/1 var(--font-sans)', letterSpacing: '-.03em', color: 'var(--white)' }}>vitrine<span style={{ color: 'var(--lime-500)' }}>.</span></span>
          <p style={{ font: '400 14px/1.55 var(--font-sans)', maxWidth: 240 }}>Projeto de estudo de portfólio. Marca e produtos fictícios.</p>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ font: '600 14px/1 var(--font-sans)', color: 'var(--white)' }}>{h}</span>
            {ls.map((l) => <a key={l} style={{ font: '400 14px/1.3 var(--font-sans)', color: 'var(--ink-300)', textDecoration: 'none' }}>{l}</a>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--border-inverse)', padding: '20px var(--gutter)', textAlign: 'center', font: '400 13px/1 var(--font-sans)' }}>© 2026 Vitrine · Estudo de design</div>
    </footer>
  );
}
window.Footer = Footer;
