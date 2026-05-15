#!/usr/bin/env node

/**
 * Flowchart Parser
 * Parses Markdown requirement documents and extracts flow nodes
 */

const parseFlowchart = (markdown) => {
  const nodes = [];
  const lines = markdown.split('\n').filter(l => l.trim());

  // Patterns for flow detection
  const sequentialMarkers = [
    '首先', '然后', '接下来', '最后', '以及', '其次', '接着', '1.', '2.', '3.', '4.', '5.',
    'first', 'then', 'next', 'finally', 'also', 'and then',
  ];

  const decisionMarkers = [
    '如果', '是否', '当', '假如', '是否要', '要不要',
    'whether', 'if', 'when', 'decision'
  ];

  const terminatorMarkers = [
    '结束', '完成', 'terminate', 'end', 'done'
  ];

  let nodeId = 0;
  let prevNode = null;
  let firstNode = true;

  lines.forEach((line) => {
    // Skip level 1 headers (title lines starting with #)
    if (/^#\s+[^#]/.test(line)) return;

    const trimmed = line.replace(/^[-*#\s]+/, '').trim();

    // Skip empty lines
    if (!trimmed) return;

    // Check for decision points
    const isDecision = decisionMarkers.some(m => trimmed.includes(m));

    // Check for terminators
    const isTerminator = terminatorMarkers.some(m => trimmed.includes(m));

    // Check for sequential markers
    const hasSequential = sequentialMarkers.some(m => trimmed.includes(m));

    // Determine node type
    let type = 'process';
    if (isDecision) type = 'decision';
    if (isTerminator) type = 'terminator';
    if (firstNode && !isDecision && !isTerminator) {
      type = 'start';
      firstNode = false;
    }

    const node = {
      id: `N${nodeId++}`,
      label: trimmed,
      type
    };

    nodes.push(node);

    // Create edge from previous node
    if (prevNode) {
      prevNode.nextId = node.id;
    }

    prevNode = node;
  });

  return nodes;
};

// Generate Mermaid code from nodes
const generateMermaid = (nodes) => {
  if (nodes.length === 0) {
    return null;
  }

  let mermaid = 'graph TD\n';

  nodes.forEach((node) => {
    let shape = '';
    switch (node.type) {
      case 'start':
        shape = `[${node.label}]`;
        break;
      case 'decision':
        shape = `{${node.label}}`;
        break;
      case 'terminator':
        shape = `([${node.label}])`;
        break;
      default:
        shape = `[${node.label}]`;
    }

    mermaid += `    ${node.id}${shape}\n`;

    // Add edge to next node
    if (node.nextId) {
      if (node.type === 'decision') {
        mermaid += `    ${node.id} -->|是| ${node.nextId}\n`;
      } else {
        mermaid += `    ${node.id} --> ${node.nextId}\n`;
      }
    }
  });

  return mermaid;
};

// Main
const input = process.argv.slice(2).join(' ');
const markdown = input || '';
const nodes = parseFlowchart(markdown);
const mermaid = generateMermaid(nodes);

if (mermaid) {
  console.log(mermaid);
} else {
  console.error('No flow detected in the input');
  process.exit(1);
}