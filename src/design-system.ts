/**
 * Entry de librería para Claude Design (/design-sync). No lo consume la app:
 * solo reexporta los componentes compartidos y arranca i18n.
 */
import './i18n';
import './styles/global.css';
import './styles/ds-fonts.css';

export { CallVolume } from './components/common/CallVolume';
export { EmptyState } from './components/common/EmptyState';
export { ErrorState } from './components/common/ErrorState';
export { HealthDot } from './components/common/HealthDot';
export { Icon } from './components/common/Icon';
export { MethodBadge } from './components/common/MethodBadge';
export { Modal } from './components/common/Modal';
export { Segmented } from './components/common/Segmented';
export { ServiceRef } from './components/common/ServiceRef';
export { Skeleton, TableSkeleton } from './components/common/Skeleton';
export { Snackbar } from './components/common/Snackbar';
export { SortableHeader } from './components/common/SortableHeader';
export { Breadcrumbs } from './components/layout/Breadcrumbs';
export { TopBar } from './components/layout/TopBar';
