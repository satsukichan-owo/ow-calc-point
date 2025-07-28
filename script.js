const defaultPlayers = [
  ["A", 7, "", 4],
  ["B", 6, 6, 5],
  ["C", "", 6, 7],
  ["D", 6, 6, 7],
  ["E", "", 6, 6]
];

function addRow(name = "", tank = "", dps = "", support = "") {
  const tbody = document.getElementById("playerTbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" value="${name}" /></td>
    <td><input type="number" value="${tank}" /></td>
    <td><input type="number" value="${dps}" /></td>
    <td><input type="number" value="${support}" /></td>
    <td><button class="remove-btn" onclick="this.closest('tr').remove()">🗑️</button></td>
  `;
  tbody.appendChild(row);
}

function generateTeams() {
  const maxPoints = parseInt(document.getElementById("maxPoints").value);
  const maxPlayers = parseInt(document.getElementById("maxPlayers").value);
  const rows = document.querySelectorAll("#playerTbody tr");
  const players = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const name = inputs[0].value.trim();
    const tank = inputs[1].value;
    const dps = inputs[2].value;
    const support = inputs[3].value;
    if (!name) return;
    if (tank !== '') players.push({ name, role: "タンク", pt: Number(tank) });
    if (dps !== '') players.push({ name, role: "dps", pt: Number(dps) });
    if (support !== '') players.push({ name, role: "サポート", pt: Number(support) });
  });

  const uniqueNames = new Set(players.map(p => p.name));
  if (uniqueNames.size < maxPlayers) {
    document.getElementById("output").textContent = `${maxPlayers}人以上のプレイヤーが必要です。`;
    return;
  }

  const nameToRoles = {};
  for (const p of players) {
    if (!nameToRoles[p.name]) nameToRoles[p.name] = [];
    nameToRoles[p.name].push({ role: p.role, pt: p.pt });
  }

  const combinations = getCombinations([...uniqueNames], maxPlayers);
  const validTeams = [];

  for (const names of combinations) {
    const candidates = [];
    for (const name of names) {
      candidates.push(...nameToRoles[name].map(r => ({ name, ...r })));
    }

    const tank = candidates.filter(p => p.role === "タンク");
    const dps = candidates.filter(p => p.role === "dps");
    const support = candidates.filter(p => p.role === "サポート");

    for (const t of tank) {
      for (let i = 0; i < dps.length; i++) {
        for (let j = i + 1; j < dps.length; j++) {
          for (let x = 0; x < support.length; x++) {
            for (let y = x + 1; y < support.length; y++) {
              const team = [t, dps[i], dps[j], support[x], support[y]];
              const namesSet = new Set(team.map(p => p.name));
              if (namesSet.size === maxPlayers) {
                const totalPt = team.reduce((sum, p) => sum + p.pt, 0);
                if (totalPt <= maxPoints) validTeams.push(team);
              }
            }
          }
        }
      }
    }
  }

  if (validTeams.length === 0) {
    document.getElementById("output").textContent = "条件を満たすチームは見つかりませんでした。";
    return;
  }

  let isExpanded = false;
  const outputElement = document.getElementById("output");

  const render = () => {
    let teams = isExpanded ? validTeams : validTeams.slice(0, 10);
    let result = `条件を満たすチーム数: ${validTeams.length}\n\n`;

    teams.forEach((team, idx) => {
      const total = team.reduce((sum, p) => sum + p.pt, 0);
      result += `▼ チーム${idx + 1}（${total}pt）\n`;
      team.forEach(p => {
        result += `${p.name}（${p.role} ${p.pt}pt）\n`;
      });
      result += `\n`;
    });

    if (validTeams.length > 10 && !isExpanded) {
      result += "...\n\n[全件を見る]";
    } else if (isExpanded) {
      result += "\n[10件のみ表示]";
    }

    outputElement.textContent = result;
  };

  outputElement.onclick = (e) => {
    if (e.target.textContent.includes("全件を見る")) {
      isExpanded = true;
      render();
    } else if (e.target.textContent.includes("10件のみ表示")) {
      isExpanded = false;
      render();
    }
  };

  render();
}


function getCombinations(arr, k) {
  const results = [];
  function combine(path, start) {
    if (path.length === k) {
      results.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combine([...path, arr[i]], i + 1);
    }
  }
  combine([], 0);
  return results;
}

window.onload = () => {
  defaultPlayers.forEach(p => addRow(...p));
};
