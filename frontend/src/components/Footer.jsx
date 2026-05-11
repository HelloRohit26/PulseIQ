export default function Footer() {
  return (
    <footer className="w-full px-(--spacing-container-margin) py-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest border-t border-border-subtle relative z-50">
      <div className="text-on-surface font-bold font-ticker text-[14px] flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">hub</span>
        PulseIQ
      </div>
      <nav className="flex flex-wrap justify-center gap-6">
        {['Kafka Architecture', 'Gemini Pro Docs', 'System Status', 'Security Compliance'].map((link) => (
          <a
            key={link}
            href="#"
            className="font-ticker text-[14px] text-outline hover:text-accent-electric underline underline-offset-4 hover:opacity-100 transition-opacity opacity-80"
          >
            {link}
          </a>
        ))}
      </nav>
      <div className="font-ticker text-[14px] text-accent-electric opacity-70">
        © 2024 PulseIQ Intelligence. All systems operational.
      </div>
    </footer>
  );
}
