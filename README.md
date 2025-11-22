# bw-th-tom-wrenn
## API Documentation

**POST /ingest**

{
  "id": "1234",
  "readings": [
    {
      "timestamp": "2023-01-01T00:00:00Z",
      "count": 3
    }
  ]
}

**GET /devices/:deviceId/latest_timestamp**

{
  "latest_timestamp": "2023-01-01T00:00:00Z"
}

**GET /devices/:deviceId/cumulative_count**

{
  "cumulative_count": 300
}

**GET /devices/:deviceId**

{
  "data": {
    "2023-01-01T00:00:00Z": 3,
    "2023-01-01T00:00:01Z": 2,
  },
  "latest_timestamp": "2023-01-01T00:00:01Z",
  "cumulative_count": 5
}

## Development Process
- My most comfortable framework is Django Dynamic REST Framework in Python. 
    - I found that given the *in-memory requirment*, all the batteries included in Django Dynamic REST Framework would end up requiring disabling core features and require strange hacks all over the place to behave correctly.
    - Therefore I decided to a stack I have less experience with but have been using in other interviews lately.
    - Decided to go with a simple Node.js + Express.js + TypeScript stack.
- Started the project with a boilerplate I've used before.
- Used Augment Code Coding Agent to help with multi file changes and solving strange TypeScript errors I have less experience with.
- Used ChatGPT Pro for strategic/best practice/Things-I-Used-To-Google questions like what are the popular patterns for responding to a injest request with a mix of successes and failures.
- Used Augment Code Autocomplete extensively in unit test assertions and documentation.

## Things I Would Add If I Had More Time
- Validating and/or Cleaning Timestamps
    - Right now I just rely on the alphabetical sortability of ISO8601 timestamps and don't even parse them to dates.
    - It would probably be a good idea to validate the timestamps and maybe even support slightly off but reasonable formats as well.
    - Also it's very possible that dates (or some efficient form of them) could take up less space in memory than strings and help the Memory Crash future-proofing story below.
- Persisting to Disk/DB
    - Obviously periodically persist this data somewhere. Would talk to the team about
        - expected frequency of incoming data
        - criticality of 100% data durability
    - and then would decide:
        - Redis for high frequency persistence to redis and then to disk.
        - Maybe Postgres or maybe even S3 for lower frequency persistence (more lossy).
- Out of Memory Crash?
    - The current in-memory architecture will some day overflow memory if it runs long enough because it stores every data point.
        - This was necessary due to the requirements that:
            - We reject duplicate deviceId+timestamp pairs.
            - We allow for out of order arrivals (i.e. can't just reject <= timestamps instead of storing every timestamp)
        - I would talk to the team to try to get a since of how far in the past an out of order data point COULD arrive and setup a period job to purge data that is older than that acceptable window.
        - OR rearchitect the data approach to allow this thing to scale to billions of data points without ever allowing a duplicate deviceId+timestamp pair, even if it's a data point from a IOT device that lost wifi for two years 😅.
        - Maybe there's a world where we keep the in-memory data structure but drop persisting the counts. I only stored those so I could return all the data in a nice bonus GET /devices/:deviceId endpoint.
- Performance?
    - Switch from raw js objects to a Map to improve CPU and memory usage slightly IF:
        - that small improvement will make this scale just enough within the expected requirements
        - we're going to keep using this in-memory approach
- Testing
    - I felt that, with this specific use case, I could balance testing effort well with a sort of inverted test pyramid.
    - I relied on integration tests to cover most of the important code. This was because writing a few integration tests for each of the main endpoints did a pretty good job at covering most of the code paths in this case.
    - I then filled in the more complex logic with unit tests.
    - It could use another pass of tests. But I think it's in a good position where we can add tests as future bugs and common edge cases come up as needed.



## Running with Docker

Development server (hot reload):

```bash
make docker-dev
```

The server will come up on http://localhost:3000 by default. You can change the port by copying `.env.example` to `.env` and editing the port.

Test suite (watch mode):

```bash
make docker-test
```


## Running without Docker

If you prefer not to use Docker, you can run the app directly with Bun:

```bash
bun run start
```

Requires Node 20+ and Bun installed.
