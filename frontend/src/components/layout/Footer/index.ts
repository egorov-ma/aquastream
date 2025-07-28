import CompanyInfo from './CompanyInfo';
import { 
  DEFAULT_NAV_LINKS, 
  DEFAULT_SOCIAL_LINKS, 
  DEFAULT_CONTACT_INFO, 
  DEFAULT_COMPANY_DESCRIPTION 
} from './constants';
import ContactInfo from './ContactInfo';
import Copyright from './Copyright';
import { Footer } from './Footer';
import QuickLinks from './QuickLinks';
import { 
  TelegramIcon, 
  GitHubIcon,
  EmailIcon, 
  PhoneIcon 
} from './SocialIcons';
import SocialLinks from './SocialLinks';
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