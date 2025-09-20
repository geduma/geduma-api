## API
https://api.geduramc.com

Endpoints:

- Config Manager

  - GET `/config-manager/all`: returns all configuration variables.
  - GET `/config-manager/owner/:owner`: returns configuration variables filtered by owner.
  - GET `/config-manager/schema/:owner/:schema`: returns configuration variables filtered by owner > schema
  - GET `/config-manager/name/:owner/:schema/:name`: returns configuration variables filtered by owner > schema > name


- Snippet Vault

  - GET `/snippet-vault/all`: returns all snippets.
