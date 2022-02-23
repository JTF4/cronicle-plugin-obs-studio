#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: David Stevens 

import sys
import time
import json
import logging

logging.basicConfig(level=logging.INFO)

sys.path.append('../')
from obswebsocket import obsws, requests # noqa: E402

stdinput = sys.stdin.readline()
data = json.loads(stdinput)

try:


    host = data['params']['host']
    port = data['params']['port']
    password = data['params']['password']
    command = data['params']['command']
    enableOverride = data['params']['enableOverride']
	destinationScene = data['params']['destinationScene']

    ws = obsws(host, port, password)
    ws.connect()

    getScenes = ws.call(requests.GetSceneList())
    currentScene = getScenes.getCurrentScene()

    getStreamInformation = ws.call(requests.GetStreamingStatus())
    getStreamStatus = getStreamInformation.getStreaming()

    print("Host:" + host)
    print("Port:" + port)
    print("Password:" + password)
    print("Destination Scene:" + destinationScene)
    print("Current Scene:" + currentScene)
    print(getStreamStatus)
    print("Override Status:")
    print(enableOverride)

    try:
        #scenes = ws.call(requests.GetSceneList())
        #for s in scenes.getScenes():
        #    name = s['name']
        #    print(u"Switching to {}".format(name))
        #    ws.call(requests.SetCurrentScene(name))
        #    time.sleep(2)
        print("Started Command Processing")
        if command == "Start Streaming Bool":
            if getStreamStatus == False:
                if currentScene == destinationScene:
                    print("Already running on the correct scene: Starting Stream")
                    ws.call(requests.StartStreaming())
                else:
                    print("Setting scene to destination and starting stream")
                    ws.call(requests.SetCurrentScene(destinationScene))
                    time.sleep(2)
                    ws.call(requests.StartStreaming())
            else:
                print("Stream already running. Command halted.")
        elif command == "Stop Stream":
            ws.call(requests.StopStreaming())
        elif command == "Start Stream":
            ws.call(requests.StartStreaming())
        elif command == "Switch Scene":
            if enableOverride == "True" or getStreamStatus == False:
                ws.call(requests.SetCurrentScene(destinationScene))
            elif enableOverride == "False":
                print("Override is not enabled.")  
        
        print("End of list")

    except KeyboardInterrupt:
        pass

    ws.disconnect()

    print('{ "complete": 1 }')
except:
    print('{ "complete": 1, "code": 999, "description": "Failed to execute." }')
