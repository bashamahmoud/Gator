## Gator CLI

`gator` is a small CLI for managing RSS feeds and browsing aggregated posts stored in a PostgreSQL database.

### Requirements

- **Node.js**: v18 or newer
- **npm**: comes with Node
- **PostgreSQL**: running instance you can connect to
- **Git**: recommended for tracking changes to this repo

### Install dependencies

From the root of the repo:

```bash
npm install
```

### Configure the CLI

Gator reads its configuration from a JSON file in your home directory:

- **Path**: `~/.gatorconfig.json` (on Windows this is typically `C:\Users\<you>\.gatorconfig.json`)

Create the file with the following shape:

```json
{
  "db_url": "postgres://user:password@localhost:5432/gator",
  "current_user_name": "your-initial-username"
}
```

If `db_url` or `current_user_name` is missing or not a string, the CLI will fail fast with a validation error.

### Set up the database

Once PostgreSQL is running and `~/.gatorconfig.json` is in place:

```bash
 npx drizzle-kit generate

 npx drizzle-kit migrate
```

### Running the CLI

Use the `run start` script and pass the command after:

```bash
npm run start <command> [args...]
```

If you call it with no command, it will print:

```text
Usage: gator <command> [needed args]
```

### Core commands

Below are a few of the more important commands wired up in `src/index.ts`.

- **User management**
  - **Register a user**

    ```bash
    npm run start register username
    ```

    Creates a new user named `username` and sets her as the current user, also register will login by default.

  - **Log in as an existing user**

    ```bash
    npm run start login username
    ```

  - **List users**

    ```bash
    npm run start users
    ```

    Prints all users, marking the current one as `(current)` based on `current_user_name` in your config.

  - **Reset all users (destructive)**

    ```bash
    npm run start reset
    ```

- **Feed management**
  - **List all feeds**

    ```bash
    npm run start feeds
    ```

  - **Add a new feed and follow it**

    ```bash
    npm run start addfeed "My Blog" https://example.com/rss.xml
    ```

    This creates a feed owned by the current user and automatically follows it for that user.

  - **Follow an existing feed by URL**

    ```bash
    npm run start follow https://example.com/rss.xml
    ```

  - **Show feeds the current user is following**

    ```bash
    npm run start following
    ```

  - **Unfollow a feed**

    ```bash
    npm run start unfollow https://example.com/rss.xml
    ```

- **Browsing posts**
  - **Browse posts for the current user**

    ```bash
    # default limit is 2
    npm run start browse

    # custom limit
    npm run start browse <custom value>
    ```

    Prints the most recent posts for the current user’s followed feeds.

- **Feed aggregation**
  - **Run the feed aggregator loop**

    ```bash
    # collect feeds every 10 seconds
    npm run start agg 10s
    ```

    The duration argument supports `ms`, `s`, `m`, or `h` (for example: `500ms`, `10s`, `5m`, `1h`).  
    This is a long‑running command; stop it with `Ctrl+C`.

### Development notes

- The CLI entrypoint is `src/index.ts`.
- Configuration is handled in `src/config.ts` and is shared by the runtime and Drizzle migrations.
- Database access is via Drizzle ORM in `src/lib/db`.