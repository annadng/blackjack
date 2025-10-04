export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center h-screen text-white">
            <h1 className="text-5xl font-bold mb-4">Blackjack</h1>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded">
                Start Game
            </button>
        </main>
    );
}