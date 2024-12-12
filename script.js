document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchDataButton');
    const loadingMessage = document.getElementById('loadingMessage');
    const tableBody = document.querySelector('#dataTable tbody');

    const server = "jp1";
    const ids = Array.from({ length: 29 }, (_, i) => 37 + i); // IDs 37〜65
    const classes = [1, 2, 3];
    const blocks = [0, 1, 2, 3];

    // APIからデータを取得
    const fetchData = async () => {
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = ''; // テーブルをクリア

        for (const id of ids) {
            for (const gvgClass of classes) {
                for (const block of blocks) {
                    const url = `https://api.mentemori.icu/wg/${id}/globalgvg/${gvgClass}/${block}/latest`;

                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            console.error(`Failed to fetch data for ID ${id}, Class ${gvgClass}, Block ${block}`);
                            continue;
                        }

                        const jsonData = await response.json();
                        const castles = jsonData.data?.castles || [];
                        const guilds = jsonData.data?.guilds || {};

                        // データをテーブルに追加
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
                        });
                    } catch (error) {
                        console.error(`Error fetching data: ${error}`);
                    }
                }
            }
        }

        loadingMessage.style.display = 'none';
    };

    // ボタンクリック時にデータを取得
    fetchDataButton.addEventListener('click', fetchData);
});
