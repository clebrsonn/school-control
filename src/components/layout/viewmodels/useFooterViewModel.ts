import { useTranslation } from 'react-i18next';

export function useFooterViewModel() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return {
    t,
    currentYear,
  };
}

