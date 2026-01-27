// Cartoon 3D rapper-style avatars inspired by famous rapper looks
export interface Avatar {
  id: string;
  name: string;
  description: string;
  emoji: string; // Using emojis as placeholder until images are generated
  style: string;
}

export const avatars: Avatar[] = [
  {
    id: "avatar1",
    name: "Gold Chain",
    description: "Heavy gold chains, bucket hat vibes",
    emoji: "👑",
    style: "bg-gradient-to-br from-yellow-400 to-orange-500"
  },
  {
    id: "avatar2",
    name: "Bandana Boss",
    description: "Red bandana, West Coast style",
    emoji: "🔴",
    style: "bg-gradient-to-br from-red-500 to-rose-600"
  },
  {
    id: "avatar3",
    name: "Ice King",
    description: "Diamond grills, icy everything",
    emoji: "💎",
    style: "bg-gradient-to-br from-cyan-400 to-blue-500"
  },
  {
    id: "avatar4",
    name: "Dreads Don",
    description: "Long dreads, purple vibes",
    emoji: "🟣",
    style: "bg-gradient-to-br from-purple-500 to-indigo-600"
  },
  {
    id: "avatar5",
    name: "Fresh Fade",
    description: "Clean fade, designer shades",
    emoji: "😎",
    style: "bg-gradient-to-br from-gray-700 to-gray-900"
  },
  {
    id: "avatar6",
    name: "Pink Wave",
    description: "Pink hair, new school style",
    emoji: "💗",
    style: "bg-gradient-to-br from-pink-400 to-fuchsia-500"
  },
  {
    id: "avatar7",
    name: "Green Money",
    description: "Money green fit, cash vibes",
    emoji: "💚",
    style: "bg-gradient-to-br from-green-500 to-emerald-600"
  },
  {
    id: "avatar8",
    name: "OG Classic",
    description: "Old school Timbs and hoodie",
    emoji: "🧱",
    style: "bg-gradient-to-br from-amber-600 to-amber-800"
  }
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return avatars.find(avatar => avatar.id === id);
};
