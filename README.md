# Single Instance Web3

This repository demonstrates a design pattern where DApps can define the instance of Web3 at a single place & require it anywhere along with maintaining consistency across all verions of the instance.

## Idea

A reactor pattern is used to re-require the web3 instance whenever a change in state occurs

