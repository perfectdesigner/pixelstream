# Copyright 1998-2018 Epic Games, Inc. All Rights Reserved.

$PublicIp = (Invoke-WebRequest -Uri "http://api.ipify.org" -UseBasicParsing).content

#$PublicIp =  '15.229.62.166'

Write-Output "Public IP: $PublicIp"

$peerConnectionOptions = "{ \""iceServers\"": [{\""urls\"": [\""stun:stun1.l.google.com:19302\"",\""turn:" + $PublicIp + ":19303\""], \""username\"": \""PixelStreamingUser\"", \""credential\"": \""Another TURN in the road\""}] }"

$ProcessExe = "node.exe"
$Arguments = @("cirrus", "--peerConnectionOptions=""$peerConnectionOptions""", "--PublicIp=$PublicIp")
# Add arguments passed to script to Arguments for executable
$Arguments += $args

Write-Output "Running: $ProcessExe $Arguments"
Start-Process -FilePath $ProcessExe -ArgumentList $Arguments -Wait -NoNewWindow
