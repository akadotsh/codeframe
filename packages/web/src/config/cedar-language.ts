const cedarLanguage = {
  displayName: "Cedar",
  name: "cedar",
  scopeName: "source.cedar",
  patterns: [
    { include: "#comments" },
    { include: "#annotations" },
    { include: "#keywords" },
    { include: "#constants" },
    { include: "#functions" },
    { include: "#entities" },
    { include: "#numbers" },
    { include: "#strings" },
  ],
  repository: {
    comments: {
      name: "comment.line.double-slash.cedar",
      match: "//.*$",
    },
    annotations: {
      match: "\\s*([@][_a-zA-Z][_a-zA-Z0-9]*)\\(",
      captures: { "1": { name: "entity.name.decorator.cedar" } },
    },
    keywords: {
      name: "keyword.control.cedar",
      match: "\\b(permit|forbid|when|unless|in|has|like|if|then|else|is)\\b",
    },
    constants: {
      name: "variable.other.constant.cedar",
      match: "\\b(principal|action|resource|context|true|false)\\b",
    },
    functions: {
      match:
        "\\b(ip|decimal|datetime|duration|contains|containsAll|containsAny|isEmpty|getTag|hasTag)\\(",
      captures: { "1": { name: "support.function.cedar" } },
    },
    entities: {
      match: "\\b(([_a-zA-Z][_a-zA-Z0-9]*::)+[_a-zA-Z][_a-zA-Z0-9]*)\\b",
      captures: { "1": { name: "entity.name.type.cedar" } },
    },
    numbers: {
      name: "constant.numeric.cedar",
      match: "\\b([1-9]+[0-9]*|0)\\b",
    },
    strings: {
      name: "string.quoted.double.cedar",
      begin: '"',
      end: '"',
      patterns: [{ name: "constant.character.escape.cedar", match: "\\\\." }],
    },
  },
};

export default [cedarLanguage];
