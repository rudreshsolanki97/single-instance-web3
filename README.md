# Single Instance Web3

This repository demonstrates a design pattern where DApps can define the instance of Web3 at a single place & require it anywhere along with maintaining consistency across all the instances.

## Approach

A reactor pattern is used to re-require the web3 instance whenever a change in provider-WS occurs

### Todo

- [x] Pre-liminary working example
- [ ] Prevent/mitigate cache busting
- [ ] Add test files for duplicate runs
- [ ] Create a wrapper module for this code snippet & publish

## Caveats

- Busting module cache will lead to running of multiple instances of the module
