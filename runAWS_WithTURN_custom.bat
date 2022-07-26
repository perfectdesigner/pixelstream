:: Copyright Epic Games, Inc. All Rights Reserved.
@echo off

pushd %~dp0

title Cirrus

::Run node server

Powershell.exe -executionpolicy unrestricted -File Start_AWS_WithTURN_SignallingServer.ps1

popd
pause
