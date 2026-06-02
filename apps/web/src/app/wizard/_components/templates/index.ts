export const DEFAULT_CHALLENGE_TEMPLATE = 'type HelloWorld = ""';

export const DEFAULT_TEST_CASES = `// TEST CASE START (code in test cases is not editable)
Extends<HelloWorld, \`Hello, \${string}\` >()

Extends<HelloWorld, \`\${string}!\` >()
// TEST CASE END`;

export const DEFAULT_DESCRIPTION = `### Description

Please enter a well-written description of your challenge.
  
### Examples

\`\`\`typescript
type Example = HelloWorld;
\`\`\`
`;
