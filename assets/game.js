(() => {
	const settingsKey = 'heroGameSettings';
	const musicTimeKey = 'heroGameMusicTime';
	const rankingKey = 'heroGameRanking';
	const historyKey = 'heroGameHistory';
	const defaults = { musicOn: true, volume: 0.5 };
	const settings = { ...defaults, ...JSON.parse(localStorage.getItem(settingsKey) || '{}') };
	const navigationType = performance.getEntriesByType('navigation')[0]?.type;
	if (navigationType === 'reload') sessionStorage.removeItem(musicTimeKey);
	const savedMusicTime = Number(sessionStorage.getItem(musicTimeKey) || 0);
	const audio = document.createElement('audio');
	audio.src = new URL('thunderstruck.mp3', document.currentScript.src).href;
	audio.loop = true;
	audio.autoplay = true;
	audio.setAttribute('playsinline', '');
	audio.volume = settings.volume;
	audio.currentTime = savedMusicTime;
	audio.preload = 'auto';
	document.body.appendChild(audio);

	function saveSettings() {
		localStorage.setItem(settingsKey, JSON.stringify(settings));
	}

	function tryPlayMusic() {
		if (!settings.musicOn) return;
		audio.play().catch(() => {});
	}

	function renderSettings() {
		const wrapper = document.createElement('div');
		wrapper.className = 'settings-wrap';
		wrapper.innerHTML = `<button class="settings-button" type="button" aria-expanded="false" aria-controls="settings-panel" title="Open music controls"><span aria-hidden="true">&#9881;</span> Music</button><section id="settings-panel" class="settings-panel" hidden><strong>Music controls</strong><button id="music-toggle" class="music-toggle" type="button"></button><label class="volume-control" for="music-volume">Volume <input id="music-volume" type="range" min="0" max="100"></label></section>`;
		document.body.appendChild(wrapper);
		const button = wrapper.querySelector('.settings-button');
		const panel = wrapper.querySelector('.settings-panel');
		const toggle = wrapper.querySelector('#music-toggle');
		const volume = wrapper.querySelector('#music-volume');
		const updateToggle = () => {
			toggle.textContent = settings.musicOn ? 'Pause music' : 'Play music';
			toggle.setAttribute('aria-label', toggle.textContent);
		};
		updateToggle();
		volume.value = Math.round(settings.volume * 100);
		button.addEventListener('click', () => {
			const open = panel.hidden;
			panel.hidden = !open;
			document.body.classList.toggle('settings-open', open);
			button.setAttribute('aria-expanded', String(open));
		});
		toggle.addEventListener('click', () => {
			settings.musicOn = !settings.musicOn;
			saveSettings();
			if (settings.musicOn) tryPlayMusic();
			else audio.pause();
			updateToggle();
		});
		volume.addEventListener('input', () => {
			settings.volume = Number(volume.value) / 100;
			audio.volume = settings.volume;
			saveSettings();
		});
	}

	window.heroGame = {
		startMusic: tryPlayMusic,
		saveRanking(ranking) {
			localStorage.setItem(rankingKey, JSON.stringify(ranking));
		},
		getRanking() {
			return JSON.parse(localStorage.getItem(rankingKey) || '[]');
		},
		resetRanking() {
			localStorage.removeItem(rankingKey);
		},
		saveFinishedMatch(ranking) {
			const result = { timestamp: new Date().toISOString(), topThree: ranking.slice(0, 3) };
			const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
			history.unshift(result);
			localStorage.setItem(historyKey, JSON.stringify(history));
			this.saveRanking(ranking);
		},
		getHistory() {
			return JSON.parse(localStorage.getItem(historyKey) || '[]');
		}
	};

	document.addEventListener('pointerdown', tryPlayMusic, { once: true });
	document.addEventListener('keydown', tryPlayMusic, { once: true });
	document.querySelectorAll('a[href$="rank.html"]').forEach((link) => {
		link.addEventListener('click', tryPlayMusic);
	});
	renderSettings();
	tryPlayMusic();
	window.addEventListener('pagehide', () => {
		sessionStorage.setItem(musicTimeKey, String(audio.currentTime));
	});
})();
