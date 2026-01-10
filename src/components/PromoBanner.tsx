const PromoBanner = () => {
  return (
    <div 
      className="w-full bg-primary text-primary-foreground py-2 md:py-3 text-center font-semibold text-xs md:text-sm uppercase tracking-wider"
      style={{
        display: 'block',
        visibility: 'visible',
        opacity: 1,
      }}
    >
      FREE SHIPPING ON ALL ORDERS!
    </div>
  );
};

export default PromoBanner;
