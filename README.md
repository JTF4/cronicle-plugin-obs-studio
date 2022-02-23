# OBS
## About
This is a Cronicle Plugin that allows you to control OBS Studio using the websockets control.

## Installation
1. Make sure OBS Studio has the websockets plugin installed and configured.
2. Run `pip install obs-websocket-py`
3. Copy `obs.py` to your Cronicle plugins directory
4. Install OBS Plugin in Cronicle
   * Requires the following parameters:
      * `host`: Text Field: IP Address of OBS computer.
      * `port`: Text Field: Port that OBS websockets is using. Example: `4444`
      * `password`: Text Field: Password that OBS websockets is using.
      * `command`: Menu: Command to send to OBS. Items: Start Streaming Bool, Stop Stream, Start Stream, Switch Scene
      * `destinationScene`: Text Field: Scene to switch to in OBS
      * `enableOverride`: Menu: Allows you to switch scenes even if already streaming. Items: True, False
