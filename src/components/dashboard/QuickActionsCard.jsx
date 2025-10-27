import { Icon, icons } from '../../lib/icons';

export default function QuickActionsCard() {
  const actions = [
    { icon: icons.plus, label: 'New Post', href: '#compose-feed', color: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]' },
    { icon: icons.file, label: 'Journal', href: '#compose-journal', color: 'bg-purple-600 text-white hover:bg-purple-500' },
    { icon: icons.calendar, label: 'Events', href: '/events', color: 'bg-blue-600 text-white hover:bg-blue-500' },
    { icon: icons.users, label: 'Partners', href: '/partners', color: 'bg-emerald-600 text-white hover:bg-emerald-500' }
  ];

  const handleAction = (href) => {
    if (href.startsWith('#compose')) {
      // Scroll to composer and focus
      const composer = document.querySelector('[data-composer]');
      if (composer) {
        composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // If journal, click the journal tab
        if (href.includes('journal')) {
          setTimeout(() => {
            const journalBtn = document.querySelector('[data-kind="JOURNAL"]');
            journalBtn?.click();
          }, 300);
        }
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="card rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon={icons.target} className="w-4 h-4 text-[var(--accent-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Quick actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleAction(action.href)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-all ${action.color} shadow-sm hover:shadow-md`}
          >
            <Icon icon={action.icon} className="w-4 h-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
