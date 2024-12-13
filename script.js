document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchDataButton');
    const downloadCsvButton = document.getElementById('downloadCsvButton');
    const saveToWebButton = document.getElementById('saveToWebButton');
    const savedDataList = document.getElementById('savedDataList');
    const loadingMessage = document.getElementById('loadingMessage');
    const progressMessage = document.getElementById('progressMessage');
    const tableBody = document.querySelector('#dataTable tbody');

    const server = "jp1";
    const ids = Array.from({ length: 65 - 37 + 1 }, (_, i) => 37 + i);
    const classes = [1, 2, 3];
    const blocks = [0, 1, 2, 3];
    const totalRequests = ids.length * classes.length * blocks.length;
    const MAX_ENTRIES = 10;
    const PASSCODE = "1234";

    let completedRequests = 0;

    const getFormattedDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        return `${year}-${month}-${day}-${hour}`;
    };

    const fetchData = async () => {
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = '';
        progressMessage.textContent = `読み込み中: 0% (0/${totalRequests} リクエスト)`;
        completedRequests = 0;

        const allData = [];

        for (const id of ids) {
            for (const gvgClass of classes) {
                for (const block of blocks) {
                    const url = `https://api.mentemori.icu/wg/${id}/globalgvg/${gvgClass}/${block}/latest`;

                    try {
                        const response = await fetch(url);
                        if (!response.ok) continue;

                        const jsonData = await response.json();
                        const castles = jsonData.data?.castles || [];
                        const guilds = jsonData.data?.guilds || {};

                        castles.forEach(castle => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${server}</td>
                                <td>${id}</td>
                                <td>${gvgClass}</td>
                                <td>${block}</td>
                                <td>${castle.CastleId}</td>
                                <td>${castle.GuildId}</td>
                                <td>${guilds[castle.GuildId] || 'Unknown'}</td>
                                <td>${castle.AttackerGuildId}</td>
                                <td>${castle.AttackPartyCount}</td>
                                <td>${castle.DefensePartyCount}</td>
                                <td>${castle.GvgCastleState}</td>
                                <td>${new Date(castle.UtcFallenTimeStamp * 1000).toLocaleString()}</td>
                            `;
                            tableBody.appendChild(row);

                            allData.push([
                                server,
                                id,
                                gvgClass,
                                block,
                                castle.CastleId,
                                castle.GuildId,
                                guilds[castle.GuildId] || 'Unknown',
                                castle.AttackerGuildId,
                                castle.AttackPartyCount,
                                castle.DefensePartyCount,
                                castle.GvgCastleState,
                                new Date(castle.UtcFallenTimeStamp * 1000).toLocaleString(),
                            ]);
                        });
                    } finally {
                        completedRequests++;
                        const progress = Math.floor((completedRequests / totalRequests) * 100);
                        progressMessage.textContent = `読み込み中: ${progress}% (${completedRequests}/${totalRequests} リクエスト)`;
                    }
                }
            }
        }

        loadingMessage.style.display = 'none';
        progressMessage.textContent = "データ読み込みが完了しました！";

        downloadCsvButton.disabled = false;
        saveToWebButton.disabled = false;

        saveToWebButton.onclick = () => saveToWeb(allData);
    };

    const saveToWeb = (data) => {
        const passcode = prompt("パスコードを入力してください:");
        if (passcode !== PASSCODE) {
            alert("パスコードが正しくありません！");
            return;
        }

        const timestamp = getFormattedDateTime();
        const entry = { timestamp, data };

        const savedEntries = JSON.parse(localStorage.getItem("savedCsvData") || "[]");
        savedEntries.unshift(entry);

        if (savedEntries.length > MAX_ENTRIES) {
            savedEntries.pop();
        }

        localStorage.setItem("savedCsvData", JSON.stringify(savedEntries));
        displaySavedData();
    };

    const displaySavedData = () => {
        const savedEntries = JSON.parse(localStorage.getItem("savedCsvData") || "[]");
        savedDataList.innerHTML = savedEntries
            .map(entry => `<li>${entry.timestamp}</li>`)
            .join('');
    };

    fetchDataButton.addEventListener('click', fetchData);
    displaySavedData();
});
