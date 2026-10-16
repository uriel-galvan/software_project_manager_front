import { TopBar } from 'software-manager-front';

const noop = () => {};
const base = {
  onEnvironmentChange: noop,
  hash: '#/services/billing',
  isLinkCopied: false,
  onCopyLink: noop,
  onOpenSearch: noop,
  onToggleTheme: noop,
  onGoHome: noop,
};

export const Claro = () => (
  <div style={{ width: 900 }}>
    <TopBar {...base} environment="staging" theme="light" />
  </div>
);

export const EnlaceCopiado = () => (
  <div style={{ width: 900 }}>
    <TopBar {...base} environment="prod" theme="light" isLinkCopied />
  </div>
);
