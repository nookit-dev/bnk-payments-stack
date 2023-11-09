# BNK Payments Stack

## Fullstack Payments Stack Built From the Ground Up

This stack was built to simplify the development workflow to build a working fullstack prototype.

- The only thing I was not going to build from scratch was payments and so I chose Stripe.
- Built on the Bun Nook Kit library which provides serveral utilities
  - SQLite schema builder and Querying Enginer,  
  - HTML Templating engine called HTMLody and includes a CSS Engine sharing Tailwinds tried and true utility classes.
  - UUID v7, Implements the proposed UUID v7 Specification which implements timestamps in the ID generation (and yes there is utilities for extracting the timestamps)
  - Auth module which provides utilities for creating password hashing and verification
  - JWT Module implements serverside JWT token issuing upon logging in.
  - Cookie Module to store JWT
  - BNK Server - Allows a robust route configuration system to allow quick and effective middleware handling(with strong type inference), and all the  HTTP methods built right into the configurations.

### Coming Soon

In order to allow richer client-side experiences I am working on optionally adding [Turbo]("https://turbo.hotwired.dev/") and [Stimulus]("https://stimulus.hotwired.dev/reference/targets)

In essence, what Turbo allows is to build a rich interactive experience by making requests to the server and the server and respond with rendered snippets of HTML and insert the fragments anywhere you need. Handle form submissions, lazy load data from slower sources, and just about any kind of dynamic content that would involve interacting with a database.

### install dependencies

```bash
bun install
```

### Seed Database

```bash
bun run seed
```

### Start Server

```bash
bun run dev
```

### Setup and Test Stripe

This is the payments stack after all, you will need a [Stripe]("stripe.com) account and once you have an account you  will need to grab the Stripe Public Key, and the Stripe Secret Key and set those in your `.env`   (`.env.example`. provided as a starting point)

## Deploy

Deploy with server:
If you haven't already

```bash
brew install flyctl
```

[Docs]("https://fly.io/docs/hands-on/install-flyctl/")

## If you haven't signed up with fly

```bash
fly auth signup
```

## Sign In With Fly

```bash
fly auth 
```

Fly will ask yout he following:

This project was created using `bun init` in bun v1.0.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
