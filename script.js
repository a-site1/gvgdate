document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchDataButton');
    const downloadCsvButton = document.getElementById('downloadCsvButton');
    const loadingMessage = document.getElementById('loadingMessage');
    const progressMessage = document.getElementById('progressMessage');
    const tableBody = document.querySelector('#dataTable tbody');

    const server = "jp1";
    const ids = Array.from({ length: 65 - 37 + 1 }, (_, i) => 37 + i); // IDs 37〜65
    const classes = [1, 2, 3];
    const blocks = [0, 1, 2, 3];
    const totalRequests = ids.length * classes.length * blocks.length; // 合計リクエスト数
    let completedRequests = 0; // 完了したリクエスト数

    // 現在の日時を取得してフォーマット
    const getFormattedDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月を2桁に
        const day = String(now.getDate()).padStart(2, '0'); // 日を2桁に
        const hour = String(now.getHours()).padStart(2, '0'); // 時を2桁に
        return `${year}-${month}-${day}-${hour}`; // フォーマット: YYYY-MM-DD-HH
    };

    // APIからデータを取得
    const fetchData = async () => {
        loadingMessage.style.display = 'block';
        tableBody.innerHTML = ''; // テーブルをクリア
        progressMessage.textContent = `読み込み中: 0% (0/${totalRequests} リクエスト)`;
        completedRequests = 0;

        const allData = []; // すべてのデータを保存

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

                            // データを配列に保存
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
                    } catch (error) {
                        console.error(`Error fetching data for ID ${id}, Class ${gvgClass}, Block ${block}: ${error}`);
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

        // CSVダウンロードボタンを有効化
        downloadCsvButton.disabled = false;

        // CSVを生成してダウンロード
        downloadCsvButton.onclick = () => {
            const csvContent = generateCsv(allData);
            const timestamp = getFormattedDateTime(); // 日時フォーマットを取得
            const filename = `gvg_data_${timestamp}.csv`; // ファイル名に日時を追加
            downloadCsv(csvContent, filename);
        };
    };

    // CSV生成
    const generateCsv = (data) => {
        const header = [
            "Server",
            "ID",
            "Class",
            "Block",
            "CastleId",
            "GuildId",
            "GuildName",
            "AttackerGuildId",
            "AttackPartyCount",
            "DefensePartyCount",
            "GvgCastleState",
            "UtcFallenTimeStamp",
        ];
        const rows = data.map(row => row.join(","));
        return [header.join(","), ...rows].join("\n");
    };

    // CSVダウンロード
    const downloadCsv = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ボタンクリック時にデータを取得
    fetchDataButton.addEventListener('click', fetchData);
});
