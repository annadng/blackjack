export interface Card {
    name: string;
    value: number;
}

export type GameResult = "win" | "lose" | "push" | "blackjack" | null;
export type ActionType = "hit" | "stand" | null;

export interface GameHistory {
    id: string;
    username: string;
    timestamp: number;
    bet: number;
    result: "win" | "lose" | "push" | "blackjack";
    playerTotal: number;
    dealerTotal: number;
    playerCards: Card[];
    dealerCards: Card[];
    winnings: number;
}