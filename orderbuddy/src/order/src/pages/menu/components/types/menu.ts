type LocalizedString = {
  en: string;
  es?: string;
  pt?: string;
};

export interface Variant {
  id: string;
  name: string;
  priceCents: number;
  default?: boolean;
}

export interface ModifierOption {
  id: string;
  name: LocalizedString;
  priceCents: number;
}

export interface Modifier {
  id: string;
  name: LocalizedString;
  type: 'standard' | 'upsell';
  required: boolean;
  selectionMode: 'single' | 'max' | 'multiple';
  maxChoices: number;
  freeChoices: number;
  extraChoicePriceCents: number;
  options: ModifierOption[];
}

export interface MenuItemType {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrls?: string[] | null;
  categoryId: string;
  priceCents: number;
  makingCostCents: number;
  isAvailable?: boolean | null;
  stationTags?: string[] | null;
  variants?: Variant[] | null;
  modifiers?: Modifier[] | null;
}
interface Category {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  sortOrder: number;
}
export interface SelectedModifier {
  modifierId: string;
  selectedOptions: string[];
  totalPrice: number;
}
