type GameChoice = 'rock' | 'paper' | 'scissors';
type GameResult = 'win' | 'lose' | 'tie';
type GameState = 'waiting' | 'playing' | 'countdown' | 'result';

interface GameData {
  playerChoice: GameChoice | null;
  computerChoice: GameChoice | null;
  result: GameResult | null;
  playerScore: number;
  computerScore: number;
}
