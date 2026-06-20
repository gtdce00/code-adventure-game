// blocks.js — กำหนดบล็อก Blockly และ generator เป็น JavaScript
const TOOLBOX = {
  "kind": "flyoutToolbox",
  "contents": [
    { "kind": "block", "type": "move_forward" },
    { "kind": "block", "type": "turn_left" },
    { "kind": "block", "type": "turn_right" },
    { "kind": "block", "type": "jump" },
    { "kind": "block", "type": "controls_repeat_ext" },
    { "kind": "block", "type": "controls_if" }
  ]
};

// Define simple blocks
Blockly.defineBlocksWithJsonArray([
  {
    "type": "move_forward",
    "message0": "เดินไปข้างหน้า %1 ช่อง",
    "args0": [{ "type":"field_number", "name":"STEPS", "value":1, "min":1, "max":10 }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
    "type": "turn_left",
    "message0": "เลี้ยวซ้าย",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type": "turn_right",
    "message0": "เลี้ยวขวา",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  },
  {
    "type": "jump",
    "message0": "กระโดด",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20
  }
]);

// Generators to call game functions
Blockly.JavaScript['move_forward'] = function(block) {
  const n = Number(block.getFieldValue('STEPS')) || 1;
  return 'await moveForward(' + n + ');\n';
};
Blockly.JavaScript['turn_left'] = function(block) {
  return 'await turnLeft();\n';
};
Blockly.JavaScript['turn_right'] = function(block) {
  return 'await turnRight();\n';
};
Blockly.JavaScript['jump'] = function(block) {
  return 'await jump();\n';
};

// controls_repeat_ext and controls_if use Blockly's built-in generators (javascript_compressed.js)
