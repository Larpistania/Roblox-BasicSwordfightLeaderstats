// * Types
interface PlayerLeaderstats {
	Parent: Folder;
	Streak: NumberValue;
	Kills: NumberValue;
	Deaths: NumberValue;
	Ping: NumberValue;
}

// * Variables
const sPlayers = game.GetService("Players");
const sRunService = game.GetService("RunService");

const mapMountedStats = new Map<Player, PlayerLeaderstats>();
let nNextPingUpdateTime = 0;

// * Functions
function TrackPlayer(target: Player) {
	const instLeaderstats = new Instance("Folder")
	instLeaderstats.Parent = target;
	instLeaderstats.Name = "leaderstats";

	const instStreak = new Instance("NumberValue")
	instStreak.Parent = instLeaderstats;
	instStreak.Name = "Streak";

	const instKills = new Instance("NumberValue")
	instKills.Parent = instLeaderstats;
	instKills.Name = "Kills";

	const instDeaths = new Instance("NumberValue")
	instDeaths.Parent = instLeaderstats;
	instDeaths.Name = "Deaths";

	const instPing = new Instance("NumberValue")
	instPing.Parent = instLeaderstats;
	instPing.Name = "Ping";

	mapMountedStats.set(target, {
		Parent: instLeaderstats,
		Streak: instStreak,
		Kills: instKills,
		Deaths: instDeaths,
		Ping: instPing,
	})

	target.CharacterAdded.Connect((charModel) => {
		const humanoid = charModel.WaitForChild("Humanoid", 1) as Humanoid | undefined;
		if (!humanoid) return;

		humanoid.Died.Once(() => {
			instDeaths.Value += 1;
			instStreak.Value = 0;

			// Search for the "creator" instance and increment their value
			const instCreatorValue = humanoid.FindFirstChild("creator") as ObjectValue | undefined;
			if (instCreatorValue && instCreatorValue.Value?.IsA("Player")) IncreasePlayerKills(instCreatorValue.Value)
		});
	})
}

function IncreasePlayerKills(target: Player) {
	const stStats = mapMountedStats.get(target);
	if (!stStats) return;

	stStats.Kills.Value++;
	stStats.Streak.Value++;
}

function UpdatePlayersPing() {
	for (const [user, stStats] of mapMountedStats) {
		stStats.Ping.Value = math.round(user.GetNetworkPing() * 1000);
	}

	nNextPingUpdateTime = time() + 2
}

// * Connections
sPlayers.PlayerAdded.Connect((user) => {
	TrackPlayer(user);
});

sPlayers.PlayerRemoving.Connect((user) => {
	const stStats = mapMountedStats.get(user);
	if (!stStats) return;

	stStats.Parent.Destroy();
});

sRunService.Heartbeat.Connect(() => {
	const nCurrentTime = time();
	
	if (nCurrentTime >= nNextPingUpdateTime)
		UpdatePlayersPing();
});
