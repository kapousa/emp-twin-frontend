import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation(); 
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'zh', label: '中文' }, 
  ];

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    
    // Logic to set the document direction (RTL for Arabic, LTR otherwise)
    const direction = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
  };

  // Set the initial direction on component mount
  React.useEffect(() => {
    const initialDir = i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', initialDir);
  }, [i18n.resolvedLanguage]);


  return (
    // NO explicit margin (like mr-6 or sm:mr-8) here. Spacing is handled by the parent Navbar.
    <div className="relative"> 
      <select
        value={i18n.resolvedLanguage}
        onChange={handleLanguageChange}
        className="
          appearance-none bg-white border border-border rounded-md 
          py-1.5 pl-3 pr-8 text-sm font-medium text-muted-foreground 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
        "
        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }} 
        aria-label="Select Language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      
      {/* Custom arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;