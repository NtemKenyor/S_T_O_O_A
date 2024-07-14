        const memeCoins = ['pepe', 'bonk', 'popcat']; // List of meme coins
        const memeCoinsEndpoint = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + memeCoins.join(',');

        document.addEventListener('DOMContentLoaded', function () {
            loadMemeCoins();
        });

        function loadMemeCoins() {
            fetch(memeCoinsEndpoint)
                .then(response => response.json())
                .then(data => {
                    const memeCoinsContainer = document.getElementById('memeCoins');
                    data.forEach(coin => {
                        const img = document.createElement('img');
                        img.src = coin.image;
                        img.alt = coin.name;
                        img.id = coin.id;
                        img.onclick = () => loadMemeCoinData(coin);
                        memeCoinsContainer.appendChild(img);
                    });
                    loadMemeCoinData(data[0]); // Load first meme coin data by default
                })
                .catch(error => console.error('Error fetching meme coins:', error));
        }

        function loadMemeCoinData(coin) {
            const loader = document.getElementById('loader');
            loader.style.display = 'flex'; // Show loader

            const selectedContent = document.getElementById('selectedContent');
            selectedContent.innerHTML = ''; // Clear previous data

            const coinData = `
                <h3>${coin.name}</h3>
                <p>Symbol: ${coin.symbol}</p>
                <p>Current Price (CoinGecko): $<span id="coingeckoPrice">${coin.current_price}</span></p>
                <br/><br/>
                <p>Market Cap: $${coin.market_cap}</p>
                <p>24h High: $${coin.high_24h}</p>
                <p>24h Low: $${coin.low_24h}</p>
                <p class="timestamp">Last Updated: ${new Date(coin.last_updated).toLocaleString()}</p>
            `;

            selectedContent.innerHTML = coinData;

            const pythEndpoint = `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${getPythEndpointForCoin(coin.id)}`;

            fetch(pythEndpoint)
                .then(response => response.json())
                .then(data => {
                    const pythPrice = data.parsed[0].price.price * Math.pow(10, data.parsed[0].price.expo);
                    const pythPriceElement = document.createElement('p');
                    pythPriceElement.innerHTML = `<br/><br/> Current Price (Pyth Oracle): $<span id="pythPrice">${pythPrice.toFixed(8)}</span>
                    <br/> Confidence (Pyth Oracle): <span id="pythConf">${data.parsed[0].price.conf}</span>`;
                    selectedContent.appendChild(pythPriceElement);

                    calculateAverage(coin.current_price, pythPrice);
                    hideLoader();
                })
                .catch(error => {
                    console.error('Error fetching Pyth data:', error);
                    hideLoader();
                });
        }

        function calculateAverage(coinGeckoPrice, pythPrice) {
            const averageValueElement = document.getElementById('averageValue');
            const averagePrice = (parseFloat(coinGeckoPrice) + parseFloat(pythPrice)) / 2;
            averageValueElement.textContent = `Average Price: $${averagePrice.toFixed(8)}`;
        }

        function hideLoader() {
            const loader = document.getElementById('loader');
            loader.style.display = 'none';
        }

        function getPythEndpointForCoin(coinId) {
            switch (coinId) {
                case 'pepe':
                    return '0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4';
                case 'bonk':
                    return '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419';
                case 'popcat':
                    return '0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce';
                default:
                    return '';
            }
        }
