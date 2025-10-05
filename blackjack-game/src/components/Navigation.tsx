interface NavigationTools {
    chips: number;
}

export default function Navigation({ chips }: NavigationTools) {
    return (
        <nav className="bg-pink-300 text-white flex justify-between items-center p-4 shadow-md">
            <div className="flex items-center space-x-4 font-bold text-xl">
                <span>Blackjack</span>
                <span className="text-base bg-pink-400 px-2 py-1 rounded shadow">
                    Chips: {chips}
                </span>
            </div>
            <div className="space-x-4">
                <button>Home</button>
                <button>History</button>
                <button>Login</button>
            </div>
        </nav>
    );
}

