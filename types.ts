
export enum QRSize {
  SMALL = 200,
  MEDIUM = 300,
  LARGE = 400
}

export interface QRSettings {
  data: string;
  size: QRSize;
  dotsColor: string;
  backgroundColor: string;
  cornerColor: string;
  dotsType: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
}

export type Theme = 'light' | 'dark';
