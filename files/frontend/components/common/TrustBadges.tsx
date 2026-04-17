import { useTranslations } from 'next-intl';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export default function TrustBadges() {
  const t = useTranslations('Compliance');

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-brand-50 rounded-lg border border-brand-100">
      <div className="flex items-center gap-2 text-brand-700 font-medium">
        <ShieldCheck className="w-5 h-5 text-brand-600" />
        <span>{t('fdaApproved')}</span>
      </div>
      <div className="flex items-center gap-2 text-brand-700 font-medium">
        <CheckCircle2 className="w-5 h-5 text-brand-600" />
        <span>{t('gmpCertified')}</span>
      </div>
      <div className="flex items-center gap-2 text-brand-700 font-medium">
        <Award className="w-5 h-5 text-brand-600" />
        <span>{t('isoCertified')}</span>
      </div>
    </div>
  );
}
