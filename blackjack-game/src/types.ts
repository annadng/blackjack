export interface Card {
    name: string;
    value: number;
}

export type GameResult = "win" | "lose" | "push" | null;
export type ActionType = "hit" | "stand" | null;

export interface GameHistory {
    id: string;
    username: string;
    timestamp: number;
    bet: number;
    result: "win" | "lose" | "push";
    playerTotal: number;
    dealerTotal: number;
    playerCards: Card[];
    dealerCards: Card[];
    winnings: number;
}