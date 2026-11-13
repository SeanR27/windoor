# Local SQLite data

<!-- This folder contains runtime database files that must not be committed. -->

The intended development database is `windoor.db`. The repository ignore rules exclude `*.db`, `*.db-wal`, and `*.db-shm` files. Do not store secrets or committed seed data here.
