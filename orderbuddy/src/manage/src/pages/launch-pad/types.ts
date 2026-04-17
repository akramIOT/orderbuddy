import { IconType } from 'react-icons';

export interface LaunchPadApp {
  name: string;
  icon: IconType | string;
  link: string;
  iconProps?: {
    size?: number | string;
    color?: string;
  };
  isIonIcon?: boolean;
}

export interface LaunchPadSection {
  name: string;
  apps: LaunchPadApp[];
}
