export interface Kid {
  id: string;
  name: string;
  avatar: string; // emoji character
  color: string; // hex color for avatar background
  coins: number;
}

export interface Chore {
  id: string;
  title: string;
  icon: string; // emoji
  coins: number; // reward per completion
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  kidId: string;
  date: string; // YYYY-MM-DD – one completion per kid per day
}

export interface Goal {
  id: string;
  kidId: string;
  title: string;
  icon: string; // emoji
  targetCoins: number;
}
