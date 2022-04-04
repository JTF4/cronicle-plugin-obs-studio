const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

class OBSController {
	constructor() {
		let data;
		process.on('sdtin', (input) => {
			try {
				data = JSON.parse(input);
				this.reportProgress('.1');
			} catch (e) {
				this.reportError(e);
				process.exit(1);
			}

			this.host = data['params']['host'];
			this.port = data['params']['port'];
			this.password = data['params']['password'];
			this.command = data['params']['command'];
			this.enableOverride = data['params']['enableOverride'];
			this.destinationScene = data['params']['destinationScene'];

			this.reportProgress('.2');

			this.obs = obs;
			this.obs
				.connect({ address: `${this.host}:${this.port}` })
				.then(() => {
					console.log('OBS connected');
					this.reportProgress('.3');
				})
				.catch((err) => {
					console.log('OBS connection error:', err);
					this.reportError(err);
					process.exit(1);
				});

			this.obs.on('ConnectionOpened', () => {
				this.reportProgress('.4');
				switch (this.data.command) {
					case 'Start Streaming Bool':
						this.startStreamingBool();
						break;
					case 'Stop Stream':
						this.obs.send('StopStreaming');
						this.reportProgress('1');
						this.reportSuccess();
						process.exit(0);
						break;
					case 'Start Stream':
						this.obs.send('StartStreaming');
						this.reportProgress('1');
						this.reportSuccess();
						process.exit(0);
						break;
					case 'Switch Scene':
						if (this.getStatus().streaming == true) {
							if (this.enableOverride == 'True') {
								this.obs.send('SetCurrentScene', this.destinationScene).then(() => {
									this.reportProgress('1');
									this.reportSuccess();
									process.exit(0);
								});
							} else {
								console.log('Scene not switched because streaming is on and override is not enabled');
							}
						} else if (this.getStatus().streaming == false) {
							this.obs.send('SwitchScenes', this.destinationScene).then(() => {
								this.reportProgress('1');
								this.reportSuccess();
								process.exit(0);
							});
						}
						break;
					case 'GetStreamingStatus':
						let status = this.getStatus();
						this.chainData(`{ "message": "Streaming Status of ${this.host}: ${status} }`);
						break;
				}
			});

			this.obs.on('error', (err) => {
				this.reportError(err);
				process.exit(1);
			});
		});
	}

	startStreamingBool() {
		this.reportProgress('.5');
		let currentScene = this.obs.getCurrentScene();
		let status = this.obs.getStatus();

		if (status.streaming == false) {
			if (currentScene == this.destinationScene) {
				this.obs.send('StartStreaming');
				this.reportSuccess();
			} else {
				this.obs.send('SwitchScenes', this.destinationScene).then(() => {
					this.obs.send('StartStreaming');
					this.reportSuccess();
					this.reportProgress('1');
					process.exit(0);
				});
			}
		}
	}

	getStatus() {
		return this.obs.send('GetStatus');
	}

	getSceneList() {
		return this.obs.send('GetSceneList');
	}

	getSceneItemList(sceneName) {
		return this.obs.send('GetSceneItemList', {
			'scene-name': sceneName,
		});
	}

	getCurrentScene() {
		return this.obs.send('GetCurrentScene');
	}

	getSceneItemProperties(sceneName, itemName) {
		return this.obs.send('GetSceneItemProperties', {
			'scene-name': sceneName,
			'item-name': itemName,
		});
	}

	getSceneItemSourceSettings(sceneName, itemName) {
		return this.obs.send('GetSceneItemSourceSettings', {
			'scene-name': sceneName,
			'item-name': itemName,
		});
	}

	getSceneItemFilters(sceneName, itemName) {
		return this.obs.send('GetSceneItemFilters', {
			'scene-name': sceneName,
			'item-name': itemName,
		});
	}

	reportProgress(progress) {
		console.log(`{ "progress": ${progress} }`);
	}

	reportError(error) {
		console.log(`{ "complete": 1, "code": 999, "description": "${error}" }`);
	}

	chainData(data) {
		console.log(`{ "chain_data": ${data} }`);
	}

	reportSuccess() {
		console.log(`{ "complete": 1 }`);
	}
}

new OBSController();
