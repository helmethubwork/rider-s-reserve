import { useState } from 'react';
import { useSiteSettings, getSettingValue } from '@/hooks/useSiteSettings';
import { X, Info, AlertTriangle, Wrench } from 'lucide-react';

const MaintenanceBanner = () => {
  const { data: bannerSettings } = useSiteSettings('banner');
  const [isDismissed, setIsDismissed] = useState(false);

  const isActive = getSettingValue(bannerSettings, 'maintenance_banner_active', 'false');
  const bannerText = getSettingValue(bannerSettings, 'maintenance_banner_text', '');
  const bannerType = getSettingValue(bannerSettings, 'maintenance_banner_type', 'info') as 'info' | 'warning' | 'maintenance';

  // Don't render if inactive or dismissed
  if (isActive !== 'true' || isDismissed || !bannerText) return null;

  // Style configuration based on type
  const styles = {
    info: {
      bg: 'bg-blue-600 text-white',
      icon: <Info size={18} />,
    },
    warning: {
      bg: 'bg-yellow-500 text-gray-900',
      icon: <AlertTriangle size={18} />,
    },
    maintenance: {
      bg: 'bg-orange-600 text-white',
      icon: <Wrench size={18} />,
    },
  };

  const currentStyle = styles[bannerType] || styles.info;

  return (
    <div className={`${currentStyle.bg} px-4 py-3 z-50`}>
      <div className="container mx-auto flex items-center justify-center gap-3">
        {currentStyle.icon}
        <span className="text-sm font-medium">{bannerText}</span>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
