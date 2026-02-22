import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Helmet Hub Hyderabad';
const SITE_URL = 'https://www.helmethub.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION = 'Helmet Hub offers premium motorcycle helmets, riding gear, and accessories from top brands in India. Shop safe, certified, and stylish helmets online.';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  path?: string;
  type?: string;
}

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  path = '',
  type = 'website',
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Premium Motorcycle Helmets & Riding Gear in India`;
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
