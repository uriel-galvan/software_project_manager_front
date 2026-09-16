import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Snackbar } from '@/components/common/Snackbar';
import { TopBar } from '@/components/layout/TopBar';
import { HubProvider } from '@/features/shell/HubContext';
import { HubShell } from '@/features/shell/HubShell';
import { routeToHash, useHashRoute } from '@/hooks/useHashRoute';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useTheme } from '@/hooks/useTheme';

export default function App(): React.ReactElement {
  const { t } = useTranslation();
  const { route, navigate, setEnvironment } = useHashRoute();
  const { theme, toggleTheme } = useTheme();
  const snackbar = useSnackbar();

  const [healthFor, setHealthFor] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  const openHealthPanel = useCallback((slug: string): void => setHealthFor(slug), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // El enlace copiado es la URL completa, no el hash: es lo que se pega en Slack.
  const copyLink = (): void => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setIsLinkCopied(true);
        snackbar.notify(t('ENDPOINT.LINK_COPIED'), 'success');
        window.setTimeout(() => setIsLinkCopied(false), 2000);
      })
      .catch(() => snackbar.notify(t('ENDPOINT.COPY_FAILED'), 'error'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        environment={route.env}
        onEnvironmentChange={setEnvironment}
        hash={routeToHash(route)}
        isLinkCopied={isLinkCopied}
        onCopyLink={copyLink}
        onOpenSearch={() => setIsSearchOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onGoHome={() => navigate({ screen: 'services', env: route.env })}
      />

      <HubProvider
        environment={route.env}
        openHealthPanel={openHealthPanel}
        notify={snackbar.notify}
      >
        <HubShell
          route={route}
          theme={theme}
          healthFor={healthFor}
          isSearchOpen={isSearchOpen}
          onCloseHealth={() => setHealthFor(null)}
          onCloseSearch={() => setIsSearchOpen(false)}
          navigate={navigate}
        />
      </HubProvider>

      <Snackbar message={snackbar.message} onDismiss={snackbar.dismiss} />
    </div>
  );
}
