export const languageConfig = {
  TypeScript: {
    extension: "ts",
    highlighter: "typescript",
    sample: `const createFrame = (code: string) => {\n  return {\n    title: "hello-world.ts",\n    theme: "graphite",\n    ready: true,\n  };\n};\n\nconsole.log(createFrame("Ship it."));`,
  },
  JavaScript: {
    extension: "js",
    highlighter: "javascript",
    sample: `function greet(name) {\n  const message = \`Hello, \${name}!\`;\n  return message;\n}\n\nconsole.log(greet("world"));`,
  },
  Python: {
    extension: "py",
    highlighter: "python",
    sample: `def create_frame(code: str):\n    return {\n        "title": "hello.py",\n        "ready": True,\n    }\n\nprint(create_frame("Ship it."))`,
  },
  CSS: {
    extension: "css",
    highlighter: "css",
    sample: `.code-frame {\n  display: grid;\n  place-items: center;\n  padding: 4rem;\n  border-radius: 24px;\n}`,
  },
  Rust: {
    extension: "rs",
    highlighter: "rust",
    sample: `fn main() {\n    let status = "ready";\n    println!("Frame is {status}");\n}`,
  },
  Go: {
    extension: "go",
    highlighter: "go",
    sample: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Frame is ready")\n}`,
  },
} as const;

export type Language = keyof typeof languageConfig;

export const languages = Object.keys(languageConfig) as Array<Language>;
