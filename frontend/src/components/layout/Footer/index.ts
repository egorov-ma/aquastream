import { Footer } from './Footer';
import CompanyInfo from './CompanyInfo';
import QuickLinks from './QuickLinks';
import ContactInfo from './ContactInfo';
import SocialLinks from './SocialLinks';
import Copyright from './Copyright';
import { 
  DEFAULT_NAV_LINKS, 
  DEFAULT_SOCIAL_LINKS, 
  DEFAULT_CONTACT_INFO, 
  DEFAULT_COMPANY_DESCRIPTION 
} from './constants';
import { 
  TelegramIcon, 
  GitHubIcon,
  EmailIcon, 
  PhoneIcon 
} from './SocialIcons';
import type { 
  NavLink, 
  SocialLink, 
  ContactInfo as ContactInfoType, 
  FooterProps 
} from './types';

export {
  Footer,
  CompanyInfo,
  QuickLinks,
  ContactInfo,
  SocialLinks,
  Copyright,
  TelegramIcon,
  GitHubIcon,
  EmailIcon,
  PhoneIcon,
  DEFAULT_NAV_LINKS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_CONTACT_INFO,
  DEFAULT_COMPANY_DESCRIPTION
};

export type {
  NavLink,
  SocialLink,
  ContactInfoType,
  FooterProps
}; 