# Bilkent Secret Gifts

## Persistent Postgres Volume

Create the named Docker volume once on each server before running the stack:

```bash
docker volume create bilsanta_postgres_data
```

**Never** run `docker compose down -v` in production—the `-v` flag deletes this volume and wipes the database.

## Running the Stack

```bash
docker compose pull        # or build --no-cache to rebuild images
docker compose up -d
```

All data now lives in the external `bilsanta_postgres_data` volume and will survive directory changes or container rebuilds.

## Database Backups

Use the helper script to dump the live database from the droplet:

```bash
./scripts/backup_db.sh                # saves to ./backups/<db>_<timestamp>.sql
./scripts/backup_db.sh /path/to/dir   # optional custom destination
```

The script reads `.env` for `DB_NAME`/`DB_USER`, dumps via `pg_dump`, and automatically prunes files older than `BACKUP_RETENTION_DAYS` (default 7).

Store the generated SQL files off the server (e.g., object storage or another droplet) to guard against volume loss.

### Automated Backups (cron)

1. Ensure the script is executable: `chmod +x scripts/backup_db.sh`.
2. Decide on a destination, e.g. `/var/backups/bilsanta`, and make sure it exists.
3. Add a crontab entry (here, daily at 02:00) on the droplet:

   ```
   0 2 * * * cd /opt/agac && ./scripts/backup_db.sh /var/backups/bilsanta >> /var/log/bilsanta-backup.log 2>&1
   ```

4. Periodically sync `/var/backups/bilsanta` to remote storage for disaster recovery.

