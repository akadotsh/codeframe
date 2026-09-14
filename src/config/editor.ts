import type { HighlightLanguage } from "./language-loaders";

type LanguageDefinition = {
  extension: string;
  highlighter: HighlightLanguage;
  sample: string;
};

const defineLanguage = (
  extension: string,
  highlighter: HighlightLanguage,
  sample: string,
): LanguageDefinition => ({ extension, highlighter, sample });

export const languageConfig = {
  Cedar: defineLanguage("cedar", "text", `permit(principal, action, resource);`),
  Bash: defineLanguage("sh", "bash", `#!/usr/bin/env bash\necho "Hello from Vignette"`),
  Astro: defineLanguage("astro", "astro", `---\nconst title = "Hello";\n---\n<h1>{title}</h1>`),
  "C++": defineLanguage(
    "cpp",
    "cpp",
    `#include <iostream>\n\nint main() {\n  std::cout << "Hello";\n}`,
  ),
  "C#": defineLanguage("cs", "csharp", `Console.WriteLine("Hello from Vignette");`),
  Clojure: defineLanguage("clj", "clojure", `(println "Hello from Vignette")`),
  Console: defineLanguage("txt", "console", `$ npm run build\n✓ built successfully`),
  Crystal: defineLanguage("cr", "crystal", `message = "Hello from Vignette"\nputs message`),
  CSS: defineLanguage("css", "css", `.code-frame {\n  display: grid;\n  border-radius: 24px;\n}`),
  Cypher: defineLanguage("cql", "cypher", `MATCH (user:User)\nRETURN user.name`),
  Dart: defineLanguage("dart", "dart", `void main() {\n  print('Hello from Vignette');\n}`),
  Diff: defineLanguage("diff", "diff", `- const ready = false;\n+ const ready = true;`),
  Docker: defineLanguage(
    "Dockerfile",
    "dockerfile",
    `FROM node:22-alpine\nWORKDIR /app\nCMD ["npm", "start"]`,
  ),
  Elm: defineLanguage("elm", "elm", `greeting : String\ngreeting =\n    "Hello from Vignette"`),
  ERB: defineLanguage("erb", "erb", `<h1><%= @title %></h1>`),
  Elixir: defineLanguage("ex", "elixir", `message = "Hello from Vignette"\nIO.puts(message)`),
  Erlang: defineLanguage("erl", "erlang", `hello() ->\n    io:format("Hello from Vignette~n").`),
  Gleam: defineLanguage(
    "gleam",
    "gleam",
    `pub fn main() {\n  io.println("Hello from Vignette")\n}`,
  ),
  GraphQL: defineLanguage("graphql", "graphql", `query User {\n  user { id name }\n}`),
  Go: defineLanguage(
    "go",
    "go",
    `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello")\n}`,
  ),
  HCL: defineLanguage("hcl", "hcl", `resource "example" "app" {\n  name = "vignette"\n}`),
  Haskell: defineLanguage("hs", "haskell", `main :: IO ()\nmain = putStrLn "Hello from Vignette"`),
  HTML: defineLanguage("html", "html", `<main>\n  <h1>Hello from Vignette</h1>\n</main>`),
  Java: defineLanguage(
    "java",
    "java",
    `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}`,
  ),
  JavaScript: defineLanguage(
    "js",
    "javascript",
    `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("world"));`,
  ),
  Julia: defineLanguage("jl", "julia", `message = "Hello from Vignette"\nprintln(message)`),
  JSON: defineLanguage("json", "json", `{\n  "name": "Vignette",\n  "ready": true\n}`),
  JSX: defineLanguage(
    "jsx",
    "jsx",
    `export function Greeting() {\n  return <h1>Hello from Vignette</h1>;\n}`,
  ),
  Kotlin: defineLanguage("kt", "kotlin", `fun main() {\n  println("Hello from Vignette")\n}`),
  LaTeX: defineLanguage(
    "tex",
    "latex",
    `\\documentclass{article}\n\\begin{document}\nHello from Vignette\n\\end{document}`,
  ),
  Liquid: defineLanguage("liquid", "liquid", `<h1>{{ product.title }}</h1>`),
  Lisp: defineLanguage("lisp", "lisp", `(format t "Hello from Vignette~%")`),
  Lua: defineLanguage("lua", "lua", `local message = "Hello from Vignette"\nprint(message)`),
  Markdown: defineLanguage(
    "md",
    "markdown",
    `# Hello from Vignette\n\nCreate beautiful code images.`,
  ),
  MATLAB: defineLanguage("m", "matlab", `message = "Hello from Vignette";\ndisp(message);`),
  Move: defineLanguage(
    "move",
    "move",
    `module vignette::hello {\n  public fun ready(): bool { true }\n}`,
  ),
  Nix: defineLanguage(
    "nix",
    "nix",
    `{ pkgs ? import <nixpkgs> {} }:\npkgs.mkShell { buildInputs = [ pkgs.nodejs ]; }`,
  ),
  Plaintext: defineLanguage("txt", "text", `Hello from Vignette`),
  Powershell: defineLanguage(
    "ps1",
    "powershell",
    `$message = "Hello from Vignette"\nWrite-Output $message`,
  ),
  "Objective-C": defineLanguage(
    "m",
    "objc",
    `NSString *message = @"Hello from Vignette";\nNSLog(@"%@", message);`,
  ),
  OCaml: defineLanguage(
    "ml",
    "ocaml",
    `let message = "Hello from Vignette";;\nprint_endline message;;`,
  ),
  PHP: defineLanguage("php", "php", `<?php\n$message = "Hello from Vignette";\necho $message;`),
  Prisma: defineLanguage(
    "prisma",
    "prisma",
    `model User {\n  id   Int    @id @default(autoincrement())\n  name String\n}`,
  ),
  Python: defineLanguage(
    "py",
    "python",
    `def greet(name: str):\n    return f"Hello, {name}!"\n\nprint(greet("world"))`,
  ),
  R: defineLanguage("r", "r", `message <- "Hello from Vignette"\nprint(message)`),
  Ruby: defineLanguage("rb", "ruby", `message = "Hello from Vignette"\nputs message`),
  Rust: defineLanguage(
    "rs",
    "rust",
    `fn main() {\n    let status = "ready";\n    println!("Vignette is {status}");\n}`,
  ),
  Scala: defineLanguage(
    "scala",
    "scala",
    `@main def hello(): Unit =\n  println("Hello from Vignette")`,
  ),
  SCSS: defineLanguage(
    "scss",
    "scss",
    `$radius: 24px;\n\n.code-frame {\n  border-radius: $radius;\n}`,
  ),
  Solidity: defineLanguage(
    "sol",
    "solidity",
    `contract Vignette {\n  bool public ready = true;\n}`,
  ),
  SQL: defineLanguage("sql", "sql", `SELECT id, name\nFROM users\nWHERE active = true;`),
  Swift: defineLanguage("swift", "swift", `let message = "Hello from Vignette"\nprint(message)`),
  Svelte: defineLanguage(
    "svelte",
    "svelte",
    `<script>\n  let title = "Hello";\n</script>\n\n<h1>{title}</h1>`,
  ),
  TOML: defineLanguage("toml", "toml", `[package]\nname = "vignette"\nversion = "0.1.0"`),
  TypeScript: defineLanguage(
    "ts",
    "typescript",
    `const createFrame = (code: string) => {\n  return { title: "hello-world.ts", ready: true };\n};\n\nconsole.log(createFrame("Ship it."));`,
  ),
  TSX: defineLanguage(
    "tsx",
    "tsx",
    `export function Greeting() {\n  return <h1>Hello from Vignette</h1>;\n}`,
  ),
  V: defineLanguage("v", "v", `fn main() {\n  println('Hello from Vignette')\n}`),
  Vue: defineLanguage(
    "vue",
    "vue",
    `<script setup>\nconst title = "Hello"\n</script>\n\n<template><h1>{{ title }}</h1></template>`,
  ),
  XML: defineLanguage("xml", "xml", `<vignette>\n  <title>Hello</title>\n</vignette>`),
  YAML: defineLanguage(
    "yaml",
    "yaml",
    `name: Vignette\nfeatures:\n  - syntax highlighting\n  - image export`,
  ),
  Zig: defineLanguage(
    "zig",
    "zig",
    `const std = @import("std");\n\npub fn main() void {\n    std.debug.print("Hello\\n", .{});\n}`,
  ),
} as const satisfies Record<string, LanguageDefinition>;

export type Language = keyof typeof languageConfig;

export const languages = Object.keys(languageConfig) as Array<Language>;
