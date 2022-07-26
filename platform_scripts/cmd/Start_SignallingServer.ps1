# Copyright 1998-2021 Epic Games, Inc. All Rights Reserved.

. "$PSScriptRoot\Start_Common.ps1"

set_start_default_values "n" "y" # Set both TURN and STUN server defaults
use_args($args)
print_parameters

$peerConnectionOptions = "{ \""iceServers\"": [{\""stun:stun1.l.google.com:19302\"": [\""turn:127.0.0.1:19303\""]}] }"

$ProcessExe = "node.exe"
$Arguments = @("cirrus", "--peerConnectionOptions=""$peerConnectionOptions""", "--publicIp=$global:PublicIp")
# Add arguments passed to script to Arguments for executable
$Arguments += $global:CirrusCmd

Push-Location $PSScriptRoot\..\..\
Write-Output "Running: $ProcessExe $Arguments"
Start-Process -FilePath $ProcessExe -ArgumentList "$Arguments" -Wait -NoNewWindow
Pop-Location
