var utils = require('../utils');
var _ = utils.getLodash();

/**
 * A node consisting of an value, and potentially a set of operands.
 * The value will be either an operator, a string representing a variable, a
 * string representing a functional call, or a number.
 * If args are not ExpressionNode, we convert them to be so, assuming any string
 * represents a variable
 */
var ValueType = {
  ARITHMETIC: 1,
  FUNCTION_CALL: 2,
  VARIABLE: 3,
  NUMBER: 4
};

var ExpressionNode = function (val, args, blockId) {
  this.value = val;
  this.blockId = blockId;
  if (args === undefined) {
    args = [];
  }

  if (!Array.isArray(args)) {
    throw new Error("Expected array");
  }

  this.children = args.map(function (item) {
    if (!(item instanceof ExpressionNode)) {
      item = new ExpressionNode(item);
    }
    return item;
  });

  if (this.getType() === ValueType.NUMBER && args.length > 0) {
    throw new Error("Can't have args for number ExpressionNode");
  }

  if (this.getType() === ValueType.ARITHMETIC && args.length !== 2) {
    throw new Error("Arithmetic ExpressionNode needs 2 args");
  }
};
module.exports = ExpressionNode;

ExpressionNode.ValueType = ValueType;

// todo - get rid of
ExpressionNode.prototype.applyExpectation = function () {
};

/**
 * What type of expression node is this?
 */
ExpressionNode.prototype.getType = function () {
  if (["+", "-", "*", "/"].indexOf(this.value) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (typeof(this.value) === 'string') {
    if (this.children.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (typeof(this.value) === 'number') {
    return ValueType.NUMBER;
  }
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  var children = this.children.map(function (item) {
    return item.clone();
  });
  return new ExpressionNode(this.value, children, this.blockId);
};

/**
 * Replace an ExpressionNode's contents with those of another node.
 */
ExpressionNode.prototype.replaceWith = function (newNode) {
  if (!(newNode instanceof ExpressionNode)) {
    throw new Error("Must replaceWith ExpressionNode");
  }
  // clone so that we have our own copies of any objects
  newNode = newNode.clone();
  this.value = newNode.value;
  this.children = newNode.children;
};

/**
 * Evaluate the expression, returning the result.
 */
ExpressionNode.prototype.evaluate = function () {
  var type = this.getType();
  if (type === ValueType.VARIABLE || type === ValueType.FUNCTION_CALL) {
    throw new Error('Must resolve variables/functions before evaluation');
  }
  if (type === ValueType.NUMBER) {
    return this.value;
  }

  if (type !== ValueType.ARITHMETIC) {
    throw new Error('Unexpected error');
  }

  var left = this.children[0].evaluate();
  var right = this.children[1].evaluate();

  switch (this.value) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.value);
    }
};

// todo - rename/implement properly
// todo - unit test
ExpressionNode.prototype.equals = function (other) {
  if (this.value !== other.value ||
      this.children.length !== other.children.length) {
    return false;
  }

  for (var i = 0; i < this.children.length; i++) {
    if (!this.children[i].equals(other.children[i])) {
      return false;
    }
  }
  return true;
};


// todo (brent) - it's possible that we never actually have to evaluate expressions
// that have functions/variables

/**
 * Given a mapping of variables to values, replaces all instances of the variable
 * in the ExpressionNode tree with the value.
 */
ExpressionNode.prototype.replaceVariables = function (mapping) {
  if (this.getType() === ValueType.VARIABLE && mapping[this.value]) {
    this.replaceWith(mapping[this.value]);
  } else {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].replaceVariables(mapping);
    }
  }
  return this;
};

/**
 * example: f(x, y) = x + y
 * functionName is f
 * paramNames is [x, y]
 * functionExpression is x +y
 */
ExpressionNode.prototype.replaceFunction = function (functionName, orderedParams,
    functionExpression) {
  var i;
  if (this.getType() === ValueType.FUNCTION_CALL && this.value === functionName) {
    if (orderedParams.length !== this.children.length) {
      throw new Error("function with wrong number of params");
    }
    // create mapping of variables to values
    var mapping = {};
    for (i = 0; i < orderedParams.length; i++) {
      mapping[orderedParams[i]] = this.children[i];
    }
    var replacement = functionExpression.clone().replaceVariables(mapping);
    this.replaceWith(replacement);
  } else {
    for (i = 0; i < this.children.length; i++) {
      this.children[i].replaceFunction(functionName, orderedParams, functionExpression);
    }
  }
};

/**
 * Depth of this node's tree. A lone value is considered to have a depth of 0.
 */
ExpressionNode.prototype.depth = function () {
  var max = 0;
  for (var i = 0; i < this.children.length; i++) {
    max = Math.max(max, 1 + this.children[i].depth());
  }

  return max;
};

/**
 * Gets the deepest descendant operation ExpressionNode in the tree (i.e. the
 * next node to collapse
 */
ExpressionNode.prototype.getDeepestOperation = function () {
  if (this.children.length === 0) {
    return null;
  }

  var deepestChild = null;
  var deepestDepth = 0;
  for (var i = 0; i < this.children.length; i++) {
    var depth = this.children[i].depth();
    if (depth > deepestDepth) {
      deepestDepth = depth;
      deepestChild = this.children[i];
    }
  }

  if (deepestDepth === 0) {
    return this;
  }

  return deepestChild.getDeepestOperation();
};

/**
 * todo - describe and unit test
 */
ExpressionNode.prototype.canCollapse = function () {
  return this.children.length > 0;
};

/**
 * Collapses the next descendant in place. Next is defined as deepest, then
 * furthest left. Returns whether collapse was successful.
 */
ExpressionNode.prototype.collapse = function () {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    this.value = this.evaluate();
    this.children = [];
    return true;
  } else {
    return deepest.collapse();
  }
};

/**
 * todo
 * other can be Falsey, indicating everything is "diff"
 */
ExpressionNode.prototype.getTokenListDiff = function (other) {
  if (this.children.length === 0) {
    return [token(this.value.toString(), !this.equals(other))];
  }

  if (this.getType() === ValueType.ARITHMETIC) {
    var nodesMatch = other && (this.value === other.value) &&
      (this.children.length === other.children.length);
    return _.flatten([
      token('(', !nodesMatch),
      this.children[0].getTokenListDiff(nodesMatch && other.children[0]),
      token(" " + this.value + " ", !nodesMatch),
      this.children[1].getTokenListDiff(nodesMatch && other.children[1]),
      token(')', !nodesMatch)
    ]);
  }

  throw new Error("NYI");
};



///////////////////////////////////






/**
 * Do the two nodes differ only in argument order.
 */
ExpressionNode.prototype.isEquivalent = function (target) {
  return false;
  // todo

  // if (this.val !== target.val) {
  //   return false;
  // }
  //
  // if (this.isLeaf()) {
  //   return true;
  // }
  //
  // if (this.isOperation()) {
  //   if (this.args[0].isEquivalent(target.args[0])) {
  //     return this.args[1].isEquivalent(target.args[1]);
  //   } else if (this.args[0].isEquivalent(target.args[1])) {
  //     return this.args[1].isEquivalent(target.args[0]);
  //   }
  // } else {
  //   throw new Error("todo: NYI - handle functions");
  // }
  //
  // return false;
};

/**
 * Break down the expression into tokens, where each token consists of the
 * string representation of that portion of the expression, and whether or not
 * it is correct.
 */
// ExpressionNode.prototype.getTokenList = function (markNextParens) {
//   var list;
//   if (this.isLeaf()) {
//     return [token(this.val.toString(), this.valMetExpectation_ === false)];
//   }
//
//   if (this.isOperation()) {
//     var left = this.args[0];
//     var right = this.args[1];
//
//     var leafOperation = left.isLeaf() && right.isLeaf();
//     var rightDeeper = right.depth() > left.depth();
//
//     list = [token("(", markNextParens === true && leafOperation)];
//     list = list.concat(left.getTokenListDiff(markNextParens && !rightDeeper));
//     list = list.concat(token(" " + this.val + " ", this.valMetExpectation_ === false));
//     list = list.concat(right.getTokenListDiff(markNextParens && rightDeeper));
//     list = list.concat(token(")", markNextParens === true && leafOperation));
//     return list;
//   } else {
//     // todo - figure out marking when we have functions
//     list = [token(this.val, false), token("(", false)];
//     for (var i = 0; i < this.args.length; i++) {
//       if (i > 0) {
//         list = list.concat(token(",", false));
//       }
//       list = list.concat(this.args[i].getTokenListDiff(markNextParens));
//     }
//     list = list.concat(token(")", false));
//     return list;
//   }
// };



/**
 * Creates a token with the given char (which can really be a string), that
 * may or may not be "marked". Marking indicates different things depending on
 * the char.
 * todo - update me
 */
function token(str, different) {
  return { str: str, different: different };
}

// todo (brent)- may want to use lodash's isNumber
function isNumber(val) {
  return typeof(val) === "number";
}
